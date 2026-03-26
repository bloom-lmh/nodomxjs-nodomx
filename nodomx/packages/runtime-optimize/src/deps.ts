export function normalizeDependencyPath(path?: string): string | undefined {
    if (!path) {
        return;
    }
    let value = path.trim();
    if (!value || value === "$model" || value === "this") {
        return;
    }
    value = value.replace(/^\$model\./, "");
    value = value.replace(/^this\./, "");
    value = value.replace(/^\.\.\./, "");
    value = value.replace(/\[\s*(['"`])([^'"`]+)\1\s*\]/g, ".$2");
    value = value.replace(/\[\s*\d+\s*\]/g, "");
    value = value.replace(/\.{2,}/g, ".");
    value = value.replace(/^\./, "");
    value = value.replace(/\.$/, "");
    if (!value || value === "$model" || value === "this") {
        return;
    }
    return value;
}

export function mergeDependencyPaths(target: string[] = [], next?: Iterable<string>): string[] {
    if (!next) {
        return target;
    }
    for (const item of next) {
        const normalized = normalizeDependencyPath(item);
        if (!normalized || target.includes(normalized)) {
            continue;
        }
        target.push(normalized);
    }
    return target;
}

export function isRelatedDependencyPath(left?: string, right?: string): boolean {
    if (!left || !right) {
        return false;
    }
    return left === right
        || left.startsWith(right + ".")
        || right.startsWith(left + ".");
}

export function hasDependencyMatch(paths?: string[], dirtyPaths?: string[]): boolean {
    if (!dirtyPaths || dirtyPaths.length === 0) {
        return true;
    }
    if (dirtyPaths.includes("*")) {
        return true;
    }
    if (!paths || paths.length === 0) {
        return false;
    }
    for (const dirtyPath of dirtyPaths) {
        for (const path of paths) {
            if (isRelatedDependencyPath(path, dirtyPath)) {
                return true;
            }
        }
    }
    return false;
}

