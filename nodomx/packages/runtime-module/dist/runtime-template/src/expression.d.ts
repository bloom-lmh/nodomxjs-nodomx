import { Model } from "@nodomx/runtime-module";
import { Module } from "@nodomx/runtime-module";
import { ExpressionMethod } from "@nodomx/shared";
export declare class Expression {
    id: number;
    execFunc: ExpressionMethod;
    exprStr: string;
    depPaths: string[];
    hasUnknownDeps: boolean;
    constructor(exprStr: string);
    private compile;
    val(module: Module, model: Model): unknown;
    addDependency(path: string): void;
}
