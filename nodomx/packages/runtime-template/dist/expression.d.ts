import { ExpressionMethod } from "@nodomx/shared";
import type { ModelLike, ModuleLike } from "@nodomx/shared";
export declare class Expression {
    id: number;
    execFunc: ExpressionMethod;
    exprStr: string;
    depPaths: string[];
    hasUnknownDeps: boolean;
    constructor(exprStr: string);
    private compile;
    val(module: ModuleLike, model: ModelLike): unknown;
    addDependency(path: string): void;
}
