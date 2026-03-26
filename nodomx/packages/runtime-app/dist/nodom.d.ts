import { App } from "./app";
import { type DirectiveMethod, type InjectionKey, type RouteCfg, type UnknownClass } from "@nodomx/shared";
import { Module } from "@nodomx/runtime-module";
import { Route } from "@nodomx/runtime-router";
export declare class Nodom {
    static isDebug: boolean;
    static config: {
        globalProperties: Record<string, unknown>;
    };
    private static queuedPlugins;
    private static queuedComponents;
    private static queuedDirectives;
    private static queuedProvides;
    static createApp(clazz: unknown, selector?: string): App;
    static app(clazz: unknown, selector?: string): Module;
    static remount(clazz: unknown, selector?: string): Module;
    static hotReload(clazz: unknown, selector?: string, hotState?: Record<string, unknown>, changedFiles?: string[]): void;
    static captureHotState(): Record<string, unknown>;
    static debug(): void;
    static setLang(lang: string): void;
    static use(plugin: unknown, ...params: unknown[]): unknown;
    static component(name: string, clazz: UnknownClass): typeof Nodom;
    static directive(name: string, handler: DirectiveMethod, priority?: number): typeof Nodom;
    static provide<T>(key: InjectionKey<T>, value: T): typeof Nodom;
    static setGlobal(name: string, value: unknown): typeof Nodom;
    static createRoute(config: RouteCfg | Array<RouteCfg>, parent?: Route): Route;
    static createDirective(name: string, handler: DirectiveMethod, priority?: number): void;
    static registModule(clazz: unknown, name?: string): void;
    static request(config: any): Promise<unknown>;
    static setRejectTime(time: number): void;
    private static clearMountedApp;
    private static reloadChangedModules;
    private static collectHotReloadTargets;
    private static normalizeChangedFiles;
}
