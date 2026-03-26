import { type AppContext, type DirectiveMethod, type InjectionKey, type NodomApp, type NodomPlugin, type UnknownClass } from "@nodomx/shared";
import type { Module } from "@nodomx/runtime-module";
export declare function installPlugin(app: NodomApp, plugin: NodomPlugin, ...options: unknown[]): NodomApp;
export declare class App implements NodomApp {
    readonly rootComponent: UnknownClass;
    selector?: string;
    readonly context: AppContext;
    readonly config: AppContext["config"];
    instance?: Module;
    constructor(rootComponent: UnknownClass, selector?: string, seed?: AppContext);
    mount(selector?: string): Module | undefined;
    unmount(): this;
    use(plugin: NodomPlugin, ...options: unknown[]): this;
    component(name: string, clazz: UnknownClass): this;
    directive(name: string, handler: DirectiveMethod, priority?: number): this;
    provide<T>(key: InjectionKey<T>, value: T): this;
}
export declare function createApp(rootComponent: UnknownClass, selector?: string, seed?: AppContext): App;
