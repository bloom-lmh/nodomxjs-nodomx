import { Route } from "./route";
import { RouteLocation, RouteMatch, RouteMeta, RouteQuery } from "../types";

export function normalizeRoutePath(path?: string): string {
    if (!path || path.trim() === "") {
        return "/";
    }
    let value = path.trim();
    if (!value.startsWith("/")) {
        value = "/" + value;
    }
    value = value.replace(/\/{2,}/g, "/");
    if (value.length > 1 && value.endsWith("/")) {
        value = value.slice(0, -1);
    }
    return value || "/";
}

export function normalizeChildRoutePath(path?: string): string {
    if (!path || path.trim() === "" || path.trim() === "/") {
        return "";
    }
    return path.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

export function splitRoutePath(path?: string): string[] {
    const normalized = normalizeRoutePath(path);
    if (normalized === "/") {
        return [];
    }
    return normalized.slice(1).split("/").filter(Boolean).map(decodeURIComponent);
}

export function joinRoutePath(parentPath: string, childPath?: string): string {
    if (!childPath || childPath.trim() === "" || childPath.trim() === "/") {
        return normalizeRoutePath(parentPath);
    }
    if (childPath.startsWith("/")) {
        return normalizeRoutePath(childPath);
    }
    return normalizeRoutePath(`${normalizeRoutePath(parentPath)}/${childPath}`);
}

export function parseRouteUrl(url?: string): {
    path: string;
    fullPath: string;
    hash: string;
    query: RouteQuery;
} {
    const raw = (url || "/").trim() || "/";
    let path = raw;
    let hash = "";
    const hashIndex = path.indexOf("#");
    if (hashIndex !== -1) {
        hash = path.slice(hashIndex);
        path = path.slice(0, hashIndex);
    }
    let queryString = "";
    const queryIndex = path.indexOf("?");
    if (queryIndex !== -1) {
        queryString = path.slice(queryIndex + 1);
        path = path.slice(0, queryIndex);
    }
    const query = parseRouteQuery(queryString);
    const pathname = normalizeRoutePath(path);
    const normalizedQuery = stringifyRouteQuery(query);
    return {
        path: pathname,
        fullPath: `${pathname}${normalizedQuery ? `?${normalizedQuery}` : ""}${hash}`,
        hash,
        query
    };
}

export function parseRouteQuery(queryString?: string): RouteQuery {
    const query: RouteQuery = {};
    if (!queryString) {
        return query;
    }
    for (const segment of queryString.split("&")) {
        if (!segment) {
            continue;
        }
        const [rawKey, rawValue = ""] = segment.split("=");
        const key = decodeURIComponent(rawKey);
        const value = decodeURIComponent(rawValue);
        const current = query[key];
        if (current === undefined) {
            query[key] = value;
        } else if (Array.isArray(current)) {
            current.push(value);
        } else {
            query[key] = [current, value];
        }
    }
    return query;
}

export function stringifyRouteQuery(query?: RouteQuery): string {
    if (!query) {
        return "";
    }
    const parts: string[] = [];
    for (const key of Object.keys(query)) {
        const value = query[key];
        if (Array.isArray(value)) {
            for (const item of value) {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
            }
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    }
    return parts.join("&");
}

export function mergeRouteMeta(routes: Route[]): RouteMeta {
    const meta: RouteMeta = {};
    for (const route of routes) {
        Object.assign(meta, route.meta || {});
    }
    return meta;
}

export function createRouteLocation(
    routes: Route[],
    path: string,
    query: RouteQuery,
    hash: string,
    params: Record<string, unknown>
): RouteLocation {
    const matched: RouteMatch[] = routes.map(route => ({
        path: route.path,
        fullPath: route.fullPath,
        name: route.name,
        meta: route.meta || {},
        route
    }));
    return {
        path,
        fullPath: `${path}${(() => {
            const queryString = stringifyRouteQuery(query);
            return queryString ? `?${queryString}` : "";
        })()}${hash}`,
        hash,
        name: routes[routes.length - 1]?.name,
        meta: mergeRouteMeta(routes),
        query,
        params: { ...params },
        data: { ...params },
        matched
    };
}

export function isActiveRoutePath(targetPath: string, currentPath?: string): boolean {
    if (!currentPath) {
        return false;
    }
    const target = parseRouteUrl(targetPath).path;
    const current = parseRouteUrl(currentPath).path;
    return current === target || current.startsWith(`${target}/`);
}
