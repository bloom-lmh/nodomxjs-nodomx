import { Directive } from "@nodomx/runtime-template";
import { VirtualDom } from "@nodomx/runtime-template";
import { Module } from "@nodomx/runtime-module";
import { ModuleFactory } from "@nodomx/runtime-registry";
import { RenderedDom, RouteCfg, RouteGuard, RouteGuardResult, RouteLoaderResult, RouteLocation } from "@nodomx/shared";
import { Util } from "@nodomx/shared";
import { createRouteLocation, isActiveRoutePath, parseRouteUrl, splitRoutePath } from "./location";
import { Route } from "./route";

export class Router {
    private root: Route = new Route();
    private rootModule: Module;
    private basePath: string = "";
    public currentPath: string = "";
    public currentRoute: RouteLocation = createRouteLocation([], "/", {}, "", {});
    private waitList: Array<{ path: string; replace?: boolean }> = [];
    private onDefaultEnter?: (module: Module, path: string) => void;
    private onDefaultLeave?: (module: Module, path: string) => void;
    private startType: number = 0;
    private routerMap: Map<number, { activeDoms?: RenderedDom[]; wait?: Route; dom?: RenderedDom }> = new Map();
    private beforeGuards: RouteGuard[] = [];
    private afterGuards: Array<(to: RouteLocation, from?: RouteLocation) => unknown> = [];

    constructor(basePath?: string, defaultEnter?: (module: Module, path: string) => void, defaultLeave?: (module: Module, path: string) => void) {
        this.basePath = basePath ? parseRouteUrl(basePath).path : "";
        this.onDefaultEnter = defaultEnter;
        this.onDefaultLeave = defaultLeave;
        window.addEventListener("popstate", () => {
            const stateUrl = history.state?.url || `${window.location.pathname}${window.location.search}${window.location.hash}`;
            this.startType = 1;
            this.go(this.stripBasePath(stateUrl), true);
        });
    }

    public push(path: string): void {
        this.go(path);
    }

    public replace(path: string): void {
        this.go(path, true);
    }

    public go(path: string, replace?: boolean): void {
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

    public resolve(path: string): RouteLocation {
        const target = this.resolveTarget(path);
        return target.location;
    }

    public async preload(path: string): Promise<RouteLocation> {
        const resolved = await this.resolveNavigation(path, this.currentRoute);
        if (!resolved) {
            return this.currentRoute;
        }
        await this.preloadMatchedRoutes(resolved.routes, resolved.location, this.currentRoute, true);
        return resolved.location;
    }

    public beforeEach(guard: RouteGuard): this {
        if (typeof guard === "function") {
            this.beforeGuards.push(guard);
        }
        return this;
    }

    public afterEach(hook: (to: RouteLocation, from?: RouteLocation) => unknown): this {
        if (typeof hook === "function") {
            this.afterGuards.push(hook);
        }
        return this;
    }

    public addActiveDom(module: Module, dom: RenderedDom): void {
        if (!this.routerMap.has(module.id)) {
            this.routerMap.set(module.id, { activeDoms: [] });
        }
        const cfg = this.routerMap.get(module.id) as { activeDoms?: RenderedDom[] };
        cfg.activeDoms ||= [];
        const index = cfg.activeDoms.findIndex(item => item.key === dom.key);
        if (index === -1) {
            cfg.activeDoms.push(dom);
        } else {
            cfg.activeDoms.splice(index, 1, dom);
        }
    }

    public registRouter(module: Module, dom: RenderedDom): void {
        if (!this.rootModule) {
            this.rootModule = module;
        }
        if (!this.routerMap.has(module.id)) {
            this.routerMap.set(module.id, { dom });
        }
        const cfg = this.routerMap.get(module.id) as { wait?: Route; dom?: RenderedDom };
        cfg.dom = dom;
        if (cfg.wait) {
            this.prepModuleDom(module, cfg.wait);
            delete cfg.wait;
        }
    }

    public activePath(path: string): void {
        const current = parseRouteUrl(this.currentPath).path;
        const target = parseRouteUrl(path).path;
        if (!this.currentPath || target === current || target.startsWith(`${current}/`)) {
            this.go(path);
        }
    }

    public getRoot(): Route {
        return this.root;
    }

    private load(): void {
        if (this.waitList.length === 0) {
            return;
        }
        const next = this.waitList.shift() as { path: string; replace?: boolean };
        this.start(next.path, next.replace).finally(() => this.load());
    }

    private async start(path: string, replaceState?: boolean): Promise<void> {
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
                this.onDefaultLeave?.(module, from.path);
            }
            if (Util.isFunction(route.onLeave)) {
                route.onLeave?.(module, from.path);
            }
            module.unmount();
        }

        let parentModule = diff.parentRoute ? await this.getModule(diff.parentRoute) : this.rootModule;
        for (const route of diff.entering) {
            if (!route.hasTarget()) {
                continue;
            }
            const module = await this.getModule(route);
            this.handleRouteModule(route, parentModule, location);
            if (Util.isFunction(this.onDefaultEnter)) {
                this.onDefaultEnter?.(module, location.path);
            }
            if (Util.isFunction(route.onEnter)) {
                route.onEnter?.(module, location.path);
            }
            parentModule = module;
        }

        await this.syncRouteState(routes, location);

        if (this.startType !== 1) {
            const browserPath = `${this.basePath}${location.fullPath}` || "/";
            if (replaceState) {
                history.replaceState({ url: browserPath }, "", browserPath);
            } else {
                history.pushState({ url: browserPath }, "", browserPath);
            }
        }

        this.currentPath = location.fullPath;
        this.currentRoute = location;
        this.startType = 0;
        await this.runAfterEach(location, from);
        void this.preloadMatchedRoutes(routes, location, from);
    }

    private async resolveNavigation(
        path: string,
        from?: RouteLocation,
        depth: number = 0
    ): Promise<{ location: RouteLocation; routes: Route[] } | undefined> {
        if (depth > 10) {
            return;
        }
        const target = this.resolveTarget(path);
        const redirect = target.routes[target.routes.length - 1]?.redirect;
        if (redirect) {
            const nextPath = typeof redirect === "function" ? redirect(target.location) : redirect;
            if (nextPath && nextPath !== target.location.fullPath) {
                return this.resolveNavigation(nextPath, from, depth + 1);
            }
        }
        return target;
    }

    private resolveTarget(path: string): { location: RouteLocation; routes: Route[] } {
        const parsed = parseRouteUrl(this.stripBasePath(path));
        const matched = this.matchRoutes(parsed.path);
        const location = createRouteLocation(matched.routes, parsed.path, parsed.query, parsed.hash, matched.params);
        return {
            location,
            routes: matched.routes
        };
    }

    private matchRoutes(path: string): { routes: Route[]; params: Record<string, unknown> } {
        const segments = splitRoutePath(path);
        return this.matchBranch(this.root.children, segments, 0, {}) || { routes: [], params: {} };
    }

    private matchBranch(
        routes: Route[],
        segments: string[],
        startIndex: number,
        parentParams: Record<string, unknown>
    ): { routes: Route[]; params: Record<string, unknown> } | undefined {
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

    private matchRoute(
        route: Route,
        segments: string[],
        startIndex: number
    ): { consumed: number; params: Record<string, unknown> } | undefined {
        if (route.pathSegments.length === 0) {
            return { consumed: 0, params: {} };
        }
        if (startIndex + route.pathSegments.length > segments.length) {
            return;
        }
        const params: Record<string, unknown> = {};
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

    private diffRoutes(fromRoutes: Route[], toRoutes: Route[]): {
        parentRoute?: Route;
        leaving: Route[];
        entering: Route[];
    } {
        let index = 0;
        while (index < fromRoutes.length && index < toRoutes.length && fromRoutes[index].id === toRoutes[index].id) {
            index++;
        }
        const sharedRoutes = toRoutes.slice(0, index);
        return {
            parentRoute: this.findLastModuleRoute(sharedRoutes),
            leaving: fromRoutes.slice(index).filter(route => !!route.module),
            entering: toRoutes.slice(index).filter(route => route.hasTarget())
        };
    }

    private async runGuards(routes: Route[], to: RouteLocation, from?: RouteLocation): Promise<RouteGuardResult> {
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

    private async runAfterEach(to: RouteLocation, from?: RouteLocation): Promise<void> {
        for (const hook of this.afterGuards) {
            await hook(to, from);
        }
    }

    private async getModule(route: Route): Promise<Module> {
        await this.ensureRouteComponentLoaded(route);
        let current = route.getResolvedComponent();
        if (current instanceof Module) {
            route.module = current;
            return current;
        }
        if (typeof current === "string") {
            const registered = ModuleFactory.get(current) as Module | undefined;
            if (registered) {
                route.module = registered;
                return registered;
            }
            const loaded = await ModuleFactory.load(current);
            if (loaded) {
                route.setLoadedComponent(loaded as Route["component"]);
                route.module = ModuleFactory.get(loaded as never) as Module;
            }
            return route.module as Module;
        }
        if (typeof current === "function") {
            route.module = ModuleFactory.get(current as never) as Module;
            return route.module as Module;
        }
        return route.module as Module;
    }

    private async syncRouteState(routes: Route[], location: RouteLocation): Promise<void> {
        for (const route of routes) {
            if (!route.hasTarget()) {
                continue;
            }
            const module = await this.getModule(route);
            applyRouteLocation(module, location);
            if (route.parent?.module instanceof Module) {
                this.setActiveDom(route.parent.module, location.fullPath);
            }
        }
    }

    private setActiveDom(module: Module, path: string): void {
        const cfg = this.routerMap.get(module.id);
        if (!cfg?.activeDoms) {
            return;
        }
        for (const dom of cfg.activeDoms) {
            const activeField = dom.props?.["active"] as string;
            if (!activeField) {
                continue;
            }
            dom.model![activeField] = isActiveRoutePath(String(dom.props?.["path"] || ""), path);
        }
    }

    private handleRouteModule(route: Route, parentModule: Module, location: RouteLocation): void {
        const module = route.module as Module;
        applyRouteLocation(module, location);
        if (!parentModule) {
            return;
        }
        if (!this.routerMap.has(parentModule.id)) {
            this.routerMap.set(parentModule.id, {});
        }
        const cfg = this.routerMap.get(parentModule.id) as { activeDoms?: RenderedDom[]; wait?: Route; dom?: RenderedDom };
        if (!cfg.dom) {
            cfg.wait = route;
        } else {
            this.setActiveDom(parentModule, location.fullPath);
        }
        this.prepModuleDom(parentModule, route);
    }

    private prepModuleDom(module: Module, route: Route): void {
        const cfg = this.routerMap.get(module.id);
        if (!cfg?.dom) {
            return;
        }
        cfg.dom.vdom.children ||= [];
        const childModule = route.module as Module;
        const key = `${childModule.id}_r`;
        const dom = cfg.dom.children?.find(item => item.key === key);
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

    private getMatchedRoutes(location?: RouteLocation): Route[] {
        return (location?.matched || [])
            .map(item => item.route)
            .filter((item): item is Route => !!item);
    }

    private findLastModuleRoute(routes: Route[]): Route | undefined {
        for (let i = routes.length - 1; i >= 0; i--) {
            if (routes[i].hasTarget()) {
                return routes[i];
            }
        }
        return;
    }

    private async ensureRouteComponentLoaded(route: Route): Promise<void> {
        if (route.module || route.loadedComponent) {
            return;
        }
        if (route.loading) {
            await route.loading;
            return;
        }
        route.loading = (async () => {
            if (route.loader) {
                route.setLoadedComponent(await this.resolveLoadedModule(await route.loader()));
                return;
            }
            const component = route.component;
            if (typeof component === "string" && isModulePath(component)) {
                const loaded = await ModuleFactory.load(component);
                if (loaded) {
                    route.setLoadedComponent(loaded as Route["component"]);
                }
            }
        })();
        try {
            await route.loading;
        } finally {
            route.loading = undefined;
        }
    }

    private async preloadMatchedRoutes(
        routes: Route[],
        to: RouteLocation,
        from?: RouteLocation,
        forceMatched: boolean = false
    ): Promise<void> {
        for (const route of routes) {
            if (forceMatched || route.hasTarget()) {
                await this.ensureRouteComponentLoaded(route);
            }
        }
        const candidates: Route[] = [];
        for (const route of routes) {
            for (const child of route.children) {
                candidates.push(child);
            }
        }
        for (const route of candidates) {
            if (await this.shouldPreloadRoute(route, to, from)) {
                await this.ensureRouteComponentLoaded(route);
            }
        }
    }

    private async shouldPreloadRoute(route: Route, to: RouteLocation, from?: RouteLocation): Promise<boolean> {
        if (!route.hasTarget() || !route.preload) {
            return false;
        }
        if (route.preload === true) {
            return true;
        }
        return await route.preload(to, from);
    }

    private async resolveLoadedModule(result: RouteLoaderResult): Promise<Route["module"]> {
        if (result && typeof result === "object" && "default" in result) {
            return (result as { default: Route["module"] }).default;
        }
        return result as Route["module"];
    }

    private stripBasePath(path: string): string {
        if (!path) {
            return "/";
        }
        if (this.basePath && path.startsWith(this.basePath)) {
            return path.slice(this.basePath.length) || "/";
        }
        return path;
    }

    private normalizeTargetPath(path: string): string {
        return parseRouteUrl(this.stripBasePath(path)).fullPath;
    }
}

function applyRouteLocation(module: Module, location: RouteLocation): void {
    if (!module.model["$route"] || typeof module.model["$route"] !== "object") {
        module.model["$route"] = Util.clone(location) as RouteLocation;
        return;
    }
    const routeState = module.model["$route"] as RouteLocation;
    routeState.path = location.path;
    routeState.fullPath = location.fullPath;
    routeState.hash = location.hash;
    routeState.name = location.name;
    routeState.meta = Util.clone(location.meta) as RouteLocation["meta"];
    routeState.query = Util.clone(location.query) as RouteLocation["query"];
    routeState.params = Util.clone(location.params) as RouteLocation["params"];
    routeState.data = Util.clone(location.data) as RouteLocation["data"];
    routeState.matched = Util.clone(location.matched) as RouteLocation["matched"];
}

function isModulePath(value: string): boolean {
    return /^(?:\.{1,2}[\\/]|\/)|[\\/]|\.m?js$|\.nd$|\.ts$/i.test(value);
}

