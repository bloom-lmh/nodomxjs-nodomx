import { Route } from "./route";
import { RouteLocation, RouteMeta, RouteQuery } from "../types";
export declare function normalizeRoutePath(path?: string): string;
export declare function normalizeChildRoutePath(path?: string): string;
export declare function splitRoutePath(path?: string): string[];
export declare function joinRoutePath(parentPath: string, childPath?: string): string;
export declare function parseRouteUrl(url?: string): {
    path: string;
    fullPath: string;
    hash: string;
    query: RouteQuery;
};
export declare function parseRouteQuery(queryString?: string): RouteQuery;
export declare function stringifyRouteQuery(query?: RouteQuery): string;
export declare function mergeRouteMeta(routes: Route[]): RouteMeta;
export declare function createRouteLocation(routes: Route[], path: string, query: RouteQuery, hash: string, params: Record<string, unknown>): RouteLocation;
export declare function isActiveRoutePath(targetPath: string, currentPath?: string): boolean;
