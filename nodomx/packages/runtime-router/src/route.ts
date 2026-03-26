import { Module } from "@nodomx/runtime-module";
import { RouteCfg, RouteMeta, RouteRedirect, RouteGuard, UnknownClass } from "@nodomx/shared";
import { Util } from "@nodomx/shared";
import { joinRoutePath, normalizeChildRoutePath, normalizeRoutePath, splitRoutePath } from "./location";

export class Route {
    public id: number;
    public path: string = "";
    public fullPath: string = "/";
    public pathSegments: string[] = [];
    public params: string[] = [];
    public data: Record<string, unknown> = {};
    public children: Route[] = [];
    public onEnter?: (module: Module, path: string) => void;
    public onLeave?: (module: Module, path: string) => void;
    public module?: Module;
    public component?: string | UnknownClass | Module;
    public loadedComponent?: string | UnknownClass | Module;
    public loader?: RouteCfg["loader"];
    public preload?: RouteCfg["preload"];
    public beforeEnter?: RouteGuard;
    public redirect?: RouteRedirect;
    public name?: string;
    public meta: RouteMeta = {};
    public parent?: Route;
    public loading?: Promise<void>;

    constructor(config?: RouteCfg, parent?: Route) {
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
        this.loader = config.loader || config.load;
        this.preload = config.preload;
        this.onEnter = config.onEnter;
        this.onLeave = config.onLeave;

        const component = config.component || config.module || config.modulePath;
        if (component instanceof Module) {
            this.module = component;
        } else {
            this.component = component as Route["component"];
        }

        this.path = normalizeChildRoutePath(config.path);
        this.fullPath = parent ? joinRoutePath(parent.fullPath, config.path) : normalizeRoutePath(config.path);
        this.pathSegments = splitRoutePath(this.path || "/");
        this.params = this.pathSegments.filter(segment => segment.startsWith(":"))
            .map(segment => segment.slice(1));

        parent?.addChild(this);

        const children = config.children || config.routes;
        if (children && Array.isArray(children)) {
            for (const child of children) {
                new Route(child, this);
            }
        }
    }

    public addChild(child: Route): void {
        if (!this.children.includes(child)) {
            this.children.push(child);
        }
        child.parent = this;
    }

    public hasTarget(): boolean {
        return !!(this.module || this.component || this.loadedComponent || this.loader);
    }

    public getResolvedComponent(): string | UnknownClass | Module | undefined {
        return this.module || this.loadedComponent || this.component;
    }

    public setLoadedComponent(component: string | UnknownClass | Module | undefined): void {
        if (!component) {
            return;
        }
        if (component instanceof Module) {
            this.module = component;
            return;
        }
        this.loadedComponent = component;
    }

    public clone(): Route {
        const route = new Route();
        route.id = this.id;
        route.path = this.path;
        route.fullPath = this.fullPath;
        route.pathSegments = [...this.pathSegments];
        route.params = [...this.params];
        route.data = Util.clone(this.data) as Record<string, unknown>;
        route.children = this.children;
        route.onEnter = this.onEnter;
        route.onLeave = this.onLeave;
        route.module = this.module;
        route.component = this.component;
        route.loadedComponent = this.loadedComponent;
        route.loader = this.loader;
        route.preload = this.preload;
        route.beforeEnter = this.beforeEnter;
        route.redirect = this.redirect;
        route.name = this.name;
        route.meta = { ...(this.meta || {}) };
        route.parent = this.parent;
        return route;
    }
}

