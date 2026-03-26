import { DefineElement } from "./compile/defineelement";
import { VirtualDom } from "./compile/virtualdom";
import { Model } from "./module/model";
import { Module } from "./module/module";
import { NEvent } from "./render/event";
import { Route } from "./router/route";

export type RouteMeta = Record<string, unknown>;
export type RouteQueryValue = string | string[];
export type RouteQuery = Record<string, RouteQueryValue>;

export type RouteMatch = {
    path: string;
    fullPath: string;
    name?: string;
    meta: RouteMeta;
    route?: Route;
};

export type RouteLocation = {
    path: string;
    fullPath: string;
    hash: string;
    name?: string;
    meta: RouteMeta;
    query: RouteQuery;
    params: Record<string, unknown>;
    data: Record<string, unknown>;
    matched: RouteMatch[];
};

export type RouteGuardResult = boolean | void | string;
export type RouteGuard = (to: RouteLocation, from?: RouteLocation) => RouteGuardResult | Promise<RouteGuardResult>;
export type RouteRedirect = string | ((to: RouteLocation) => string);
export type RouteLoaderResult = Module | UnknownClass | string | { default: Module | UnknownClass | string };

export type RouteCfg = {
    path?: string;
    name?: string;
    meta?: RouteMeta;
    redirect?: RouteRedirect;
    beforeEnter?: RouteGuard;
    module?: Module | UnknownClass | string;
    loader?: () => Promise<RouteLoaderResult>;
    modulePath?: string;
    routes?: Array<RouteCfg>;
    onEnter?: (module: Module, path: string) => void;
    onLeave?: (module: Module, path: string) => void;
    parent?: Route;
};

export enum EModuleState {
    INIT = 1,
    UNMOUNTED = 2,
    MOUNTED = 3
}

export type RenderedDom = {
    tagName?: string;
    key: string | number;
    model?: Model;
    assets?: Record<string, unknown>;
    props?: Record<string, unknown>;
    events?: NEvent[];
    textContent?: string;
    children?: Array<RenderedDom>;
    locMap?: Map<number | string, number>;
    parent?: RenderedDom;
    staticNum?: number;
    moduleId?: number;
    slotModuleId?: number;
    childModuleId?: number;
    vdom?: VirtualDom;
    isSvg?: boolean;
    node?: Node;
    __skipDiff?: boolean;
    __used?: boolean;
};

export type UnknownClass = new (...args: unknown[]) => object;
export type DefineElementClass = new (dom: VirtualDom, module: Module) => DefineElement;
export type UnknownMethod = (...args: unknown[]) => unknown;
export type EventMethod = (model: unknown, dom: RenderedDom, evobj: unknown, event: Event) => void;
export type DirectiveMethod = (module: Module, dom: RenderedDom) => boolean;
export type ExpressionMethod = (model: Model) => unknown;
export type ChangedDom = [number, RenderedDom, RenderedDom?, RenderedDom?, number?, number?];
