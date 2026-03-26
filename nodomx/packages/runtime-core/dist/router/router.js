import { Directive } from "../compile/directive";
import { VirtualDom } from "../compile/virtualdom";
import { Module } from "../module/module";
import { ModuleFactory } from "../module/modulefactory";
import { Util } from "../util";
import { createRouteLocation, isActiveRoutePath, parseRouteUrl, splitRoutePath } from "./location";
import { Route } from "./route";
export class Router {
    constructor(basePath, defaultEnter, defaultLeave) {
        this.root = new Route();
        this.basePath = "";
        this.currentPath = "";
        this.currentRoute = createRouteLocation([], "/", {}, "", {});
        this.waitList = [];
        this.startType = 0;
        this.routerMap = new Map();
        this.beforeGuards = [];
        this.afterGuards = [];
        this.basePath = basePath ? parseRouteUrl(basePath).path : "";
        this.onDefaultEnter = defaultEnter;
        this.onDefaultLeave = defaultLeave;
        window.addEventListener("popstate", () => {
            var _a;
            const stateUrl = ((_a = history.state) === null || _a === void 0 ? void 0 : _a.url) || `${window.location.pathname}${window.location.search}${window.location.hash}`;
            this.startType = 1;
            this.go(this.stripBasePath(stateUrl), true);
        });
    }
    push(path) {
        this.go(path);
    }
    replace(path) {
        this.go(path, true);
    }
    go(path, replace) {
        const fullPath = this.normalizeTargetPath(path);
        if (!fullPath) {
            return;
        }
        if (this.waitList.find(item => item.path === fullPath && !!item.replace === !!replace)) {
            return;
        }
        this.waitList.push({ path: fullPath, replace });
        const ensureRoot = () => {
            if (!this.rootModule) {
                setTimeout(ensureRoot, 0);
                return;
            }
            this.load();
        };
        ensureRoot();
    }
    resolve(path) {
        const target = this.resolveTarget(path);
        return target.location;
    }
    beforeEach(guard) {
        if (typeof guard === "function") {
            this.beforeGuards.push(guard);
        }
        return this;
    }
    afterEach(hook) {
        if (typeof hook === "function") {
            this.afterGuards.push(hook);
        }
        return this;
    }
    addActiveDom(module, dom) {
        if (!this.routerMap.has(module.id)) {
            this.routerMap.set(module.id, { activeDoms: [] });
        }
        const cfg = this.routerMap.get(module.id);
        cfg.activeDoms || (cfg.activeDoms = []);
        const index = cfg.activeDoms.findIndex(item => item.key === dom.key);
        if (index === -1) {
            cfg.activeDoms.push(dom);
        }
        else {
            cfg.activeDoms.splice(index, 1, dom);
        }
    }
    registRouter(module, dom) {
        if (!this.rootModule) {
            this.rootModule = module;
        }
        if (!this.routerMap.has(module.id)) {
            this.routerMap.set(module.id, { dom });
        }
        const cfg = this.routerMap.get(module.id);
        cfg.dom = dom;
        if (cfg.wait) {
            this.prepModuleDom(module, cfg.wait);
            delete cfg.wait;
        }
    }
    activePath(path) {
        const current = parseRouteUrl(this.currentPath).path;
        const target = parseRouteUrl(path).path;
        if (!this.currentPath || target === current || target.startsWith(`${current}/`)) {
            this.go(path);
        }
    }
    getRoot() {
        return this.root;
    }
    load() {
        if (this.waitList.length === 0) {
            return;
        }
        const next = this.waitList.shift();
        this.start(next.path, next.replace).finally(() => this.load());
    }
    async start(path, replaceState) {
        var _a, _b, _c, _d;
        const from = this.currentRoute;
        const resolved = await this.resolveNavigation(path, from);
        if (!resolved) {
            return;
        }
        const { location, routes } = resolved;
        if (location.fullPath === this.currentPath) {
            return;
        }
        const diff = this.diffRoutes(this.getMatchedRoutes(from), routes);
        const guardRoutes = diff.entering.length > 0
            ? diff.entering
            : (from.fullPath !== location.fullPath && routes.length > 0 ? [routes[routes.length - 1]] : []);
        const guardResult = await this.runGuards(guardRoutes, location, from);
        if (typeof guardResult === "string") {
            this.go(guardResult, replaceState);
            return;
        }
        if (guardResult === false) {
            return;
        }
        for (const route of diff.leaving.slice().reverse()) {
            if (!route.module) {
                continue;
            }
            const module = await this.getModule(route);
            if (Util.isFunction(this.onDefaultLeave)) {
                (_a = this.onDefaultLeave) === null || _a === void 0 ? void 0 : _a.call(this, module, from.path);
            }
            if (Util.isFunction(route.onLeave)) {
                (_b = route.onLeave) === null || _b === void 0 ? void 0 : _b.call(route, module, from.path);
            }
            module.unmount();
        }
        let parentModule = diff.parentRoute ? await this.getModule(diff.parentRoute) : this.rootModule;
        for (const route of diff.entering) {
            if (!route.module && !route.loader) {
                continue;
            }
            const module = await this.getModule(route);
            this.handleRouteModule(route, parentModule, location);
            if (Util.isFunction(this.onDefaultEnter)) {
                (_c = this.onDefaultEnter) === null || _c === void 0 ? void 0 : _c.call(this, module, location.path);
            }
            if (Util.isFunction(route.onEnter)) {
                (_d = route.onEnter) === null || _d === void 0 ? void 0 : _d.call(route, module, location.path);
            }
            parentModule = module;
        }
        await this.syncRouteState(routes, location);
        if (this.startType !== 1) {
            const browserPath = `${this.basePath}${location.fullPath}` || "/";
            if (replaceState) {
                history.replaceState({ url: browserPath }, "", browserPath);
            }
            else {
                history.pushState({ url: browserPath }, "", browserPath);
            }
        }
        this.currentPath = location.fullPath;
        this.currentRoute = location;
        this.startType = 0;
        await this.runAfterEach(location, from);
    }
    async resolveNavigation(path, from, depth = 0) {
        var _a;
        if (depth > 10) {
            return;
        }
        const target = this.resolveTarget(path);
        const redirect = (_a = target.routes[target.routes.length - 1]) === null || _a === void 0 ? void 0 : _a.redirect;
        if (redirect) {
            const nextPath = typeof redirect === "function" ? redirect(target.location) : redirect;
            if (nextPath && nextPath !== target.location.fullPath) {
                return this.resolveNavigation(nextPath, from, depth + 1);
            }
        }
        return target;
    }
    resolveTarget(path) {
        const parsed = parseRouteUrl(this.stripBasePath(path));
        const matched = this.matchRoutes(parsed.path);
        const location = createRouteLocation(matched.routes, parsed.path, parsed.query, parsed.hash, matched.params);
        return {
            location,
            routes: matched.routes
        };
    }
    matchRoutes(path) {
        const segments = splitRoutePath(path);
        return this.matchBranch(this.root.children, segments, 0, {}) || { routes: [], params: {} };
    }
    matchBranch(routes, segments, startIndex, parentParams) {
        for (const route of routes) {
            const matched = this.matchRoute(route, segments, startIndex);
            if (!matched) {
                continue;
            }
            const params = {
                ...parentParams,
                ...matched.params
            };
            const nextIndex = startIndex + matched.consumed;
            if (route.children.length > 0) {
                const childMatch = this.matchBranch(route.children, segments, nextIndex, params);
                if (childMatch) {
                    return {
                        routes: [route, ...childMatch.routes],
                        params: childMatch.params
                    };
                }
            }
            if (nextIndex === segments.length) {
                return {
                    routes: [route],
                    params
                };
            }
        }
        return;
    }
    matchRoute(route, segments, startIndex) {
        if (route.pathSegments.length === 0) {
            return { consumed: 0, params: {} };
        }
        if (startIndex + route.pathSegments.length > segments.length) {
            return;
        }
        const params = {};
        for (let i = 0; i < route.pathSegments.length; i++) {
            const routeSegment = route.pathSegments[i];
            const currentSegment = segments[startIndex + i];
            if (routeSegment.startsWith(":")) {
                params[routeSegment.slice(1)] = currentSegment;
                continue;
            }
            if (routeSegment !== currentSegment) {
                return;
            }
        }
        return {
            consumed: route.pathSegments.length,
            params
        };
    }
    diffRoutes(fromRoutes, toRoutes) {
        let index = 0;
        while (index < fromRoutes.length && index < toRoutes.length && fromRoutes[index].id === toRoutes[index].id) {
            index++;
        }
        const sharedRoutes = toRoutes.slice(0, index);
        return {
            parentRoute: this.findLastModuleRoute(sharedRoutes),
            leaving: fromRoutes.slice(index).filter(route => !!route.module),
            entering: toRoutes.slice(index).filter(route => !!route.module || !!route.loader)
        };
    }
    async runGuards(routes, to, from) {
        for (const guard of this.beforeGuards) {
            const result = await guard(to, from);
            if (result === false || typeof result === "string") {
                return result;
            }
        }
        for (const route of routes) {
            if (!route.beforeEnter) {
                continue;
            }
            const result = await route.beforeEnter(to, from);
            if (result === false || typeof result === "string") {
                return result;
            }
        }
        return true;
    }
    async runAfterEach(to, from) {
        for (const hook of this.afterGuards) {
            await hook(to, from);
        }
    }
    async getModule(route) {
        let current = route.module;
        if (!current && route.loader) {
            current = await this.resolveLoadedModule(await route.loader());
            route.module = current;
        }
        if (current instanceof Module) {
            return current;
        }
        if (typeof current === "string") {
            const registered = ModuleFactory.get(current);
            if (registered) {
                route.module = registered;
                return registered;
            }
            const loaded = await ModuleFactory.load(current);
            if (loaded) {
                route.module = ModuleFactory.get(loaded);
            }
            return route.module;
        }
        if (typeof current === "function") {
            route.module = ModuleFactory.get(current);
            return route.module;
        }
        return route.module;
    }
    async syncRouteState(routes, location) {
        var _a;
        for (const route of routes) {
            if (!route.module && !route.loader) {
                continue;
            }
            const module = await this.getModule(route);
            applyRouteLocation(module, location);
            if (((_a = route.parent) === null || _a === void 0 ? void 0 : _a.module) instanceof Module) {
                this.setActiveDom(route.parent.module, location.fullPath);
            }
        }
    }
    setActiveDom(module, path) {
        var _a, _b;
        const cfg = this.routerMap.get(module.id);
        if (!(cfg === null || cfg === void 0 ? void 0 : cfg.activeDoms)) {
            return;
        }
        for (const dom of cfg.activeDoms) {
            const activeField = (_a = dom.props) === null || _a === void 0 ? void 0 : _a["active"];
            if (!activeField) {
                continue;
            }
            dom.model[activeField] = isActiveRoutePath(String(((_b = dom.props) === null || _b === void 0 ? void 0 : _b["path"]) || ""), path);
        }
    }
    handleRouteModule(route, parentModule, location) {
        const module = route.module;
        applyRouteLocation(module, location);
        if (!parentModule) {
            return;
        }
        if (!this.routerMap.has(parentModule.id)) {
            this.routerMap.set(parentModule.id, {});
        }
        const cfg = this.routerMap.get(parentModule.id);
        if (!cfg.dom) {
            cfg.wait = route;
        }
        else {
            this.setActiveDom(parentModule, location.fullPath);
        }
        this.prepModuleDom(parentModule, route);
    }
    prepModuleDom(module, route) {
        var _a;
        var _b;
        const cfg = this.routerMap.get(module.id);
        if (!(cfg === null || cfg === void 0 ? void 0 : cfg.dom)) {
            return;
        }
        (_b = cfg.dom.vdom).children || (_b.children = []);
        const childModule = route.module;
        const key = `${childModule.id}_r`;
        const dom = (_a = cfg.dom.children) === null || _a === void 0 ? void 0 : _a.find(item => item.key === key);
        if (!dom) {
            const vdom = new VirtualDom("div", key, module);
            const directive = new Directive("module");
            directive.value = childModule.id;
            vdom.addDirective(directive);
            cfg.dom.vdom.add(vdom);
            module.active();
            return;
        }
        childModule.srcDom = dom;
        childModule.active();
    }
    getMatchedRoutes(location) {
        return ((location === null || location === void 0 ? void 0 : location.matched) || [])
            .map(item => item.route)
            .filter((item) => !!item);
    }
    findLastModuleRoute(routes) {
        for (let i = routes.length - 1; i >= 0; i--) {
            if (routes[i].module || routes[i].loader) {
                return routes[i];
            }
        }
        return;
    }
    async resolveLoadedModule(result) {
        if (result && typeof result === "object" && "default" in result) {
            return result.default;
        }
        return result;
    }
    stripBasePath(path) {
        if (!path) {
            return "/";
        }
        if (this.basePath && path.startsWith(this.basePath)) {
            return path.slice(this.basePath.length) || "/";
        }
        return path;
    }
    normalizeTargetPath(path) {
        return parseRouteUrl(this.stripBasePath(path)).fullPath;
    }
}
function applyRouteLocation(module, location) {
    if (!module.model["$route"] || typeof module.model["$route"] !== "object") {
        module.model["$route"] = Util.clone(location);
        return;
    }
    const routeState = module.model["$route"];
    routeState.path = location.path;
    routeState.fullPath = location.fullPath;
    routeState.hash = location.hash;
    routeState.name = location.name;
    routeState.meta = Util.clone(location.meta);
    routeState.query = Util.clone(location.query);
    routeState.params = Util.clone(location.params);
    routeState.data = Util.clone(location.data);
    routeState.matched = Util.clone(location.matched);
}
//# sourceMappingURL=router.js.map