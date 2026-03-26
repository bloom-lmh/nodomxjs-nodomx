export declare function normalizeDependencyPath(path?: string): string | undefined;
export declare function mergeDependencyPaths(target?: string[], next?: Iterable<string>): string[];
export declare function isRelatedDependencyPath(left?: string, right?: string): boolean;
export declare function hasDependencyMatch(paths?: string[], dirtyPaths?: string[]): boolean;
