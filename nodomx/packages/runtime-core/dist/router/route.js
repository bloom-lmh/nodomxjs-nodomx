import { Util } from "../util";
import { joinRoutePath, normalizeChildRoutePath, normalizeRoutePath, splitRoutePath } from "./location";
export class Route {
    constructor(config, parent) {
        this.path = "";
        this.fullPath = "/";
        this.pathSegments = [];
        this.params = [];
        this.data = {};
        this.children = [];
        this.meta = {};
        this.id = Util.genId();
        this.parent = parent;
        if (!config) {
            this.fullPath = parent ? parent.fullPath : "/";
            return;
        }
        this.name = config.name;
        this.meta = { ...(config.meta || {}) };
        this.redirect = config.redirect;
        this.beforeEnter = config.beforeEnter;
        this.loader = config.loader;
        this.module = config.module || config.modulePath;
        this.onEnter = config.onEnter;
        this.onLeave = config.onLeave;
        this.path = normalizeChildRoutePath(config.path);
        this.fullPath = parent ? joinRoutePath(parent.fullPath, config.path) : normalizeRoutePath(config.path);
        this.pathSegments = splitRoutePath(this.path || "/");
        this.params = this.pathSegments.filter(segment => segment.startsWith(":"))
            .map(segment => segment.slice(1));
        parent === null || parent === void 0 ? void 0 : parent.addChild(this);
        if (config.routes && Array.isArray(config.routes)) {
            for (const child of config.routes) {
                new Route(child, this);
            }
        }
    }
    addChild(child) {
        if (!this.children.includes(child)) {
            this.children.push(child);
        }
        child.parent = this;
    }
    clone() {
        const route = new Route();
        route.id = this.id;
        route.path = this.path;
        route.fullPath = this.fullPath;
        route.pathSegments = [...this.pathSegments];
        route.params = [...this.params];
        route.data = Util.clone(this.data);
        route.children = this.children;
        route.onEnter = this.onEnter;
        route.onLeave = this.onLeave;
        route.module = this.module;
        route.loader = this.loader;
        route.beforeEnter = this.beforeEnter;
        route.redirect = this.redirect;
        route.name = this.name;
        route.meta = { ...(this.meta || {}) };
        route.parent = this.parent;
        return route;
    }
}
//# sourceMappingURL=route.js.map