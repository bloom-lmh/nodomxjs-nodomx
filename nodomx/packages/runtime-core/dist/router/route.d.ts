import { Module } from "../module/module";
import { RouteCfg, RouteMeta, RouteRedirect, RouteGuard, UnknownClass } from "../types";
export declare class Route {
    id: number;
    path: string;
    fullPath: string;
    pathSegments: string[];
    params: string[];
    data: Record<string, unknown>;
    children: Route[];
    onEnter?: (module: Module, path: string) => void;
    onLeave?: (module: Module, path: string) => void;
    module?: string | UnknownClass | Module;
    loader?: RouteCfg["loader"];
    beforeEnter?: RouteGuard;
    redirect?: RouteRedirect;
    name?: string;
    meta: RouteMeta;
    parent?: Route;
    constructor(config?: RouteCfg, parent?: Route);
    addChild(child: Route): void;
    clone(): Route;
}
