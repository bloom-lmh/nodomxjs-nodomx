import { Model } from "../module/model";
import { Module } from "../module/module";
import { ExpressionMethod } from "../types";
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
