import { Module } from "./module";
import { Model } from "./model";
export declare class ModelManager {
    private static shareModelMap;
    static addShareModel(model: Model, module: Module): void;
    static getModule(model: Model): Module | Module[];
    static update(model: any, key: any, oldValue: any, newValue: any): void;
    static get(model: Model, key?: string): unknown;
    static set(model: Model, key: string, value: unknown): void;
    private static getDirtyPath;
}
