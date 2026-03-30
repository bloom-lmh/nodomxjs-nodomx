import { createAppContext, type AppContext, type DirectiveMethod, type InjectionKey, type NodomApp, type NodomPlugin, type UnknownClass } from "@nodomx/shared";
import { DirectiveManager, ModuleFactory } from "@nodomx/runtime-registry";
import type { Module } from "@nodomx/runtime-module";
import { Renderer } from "@nodomx/runtime-view";
import { RequestManager, Scheduler } from "@nodomx/runtime-scheduler";

type DevtoolsHook = {
    notifyUpdate?: (app: App, reason: string) => void;
    registerApp?: (app: App) => void;
    unregisterApp?: (app: App) => void;
};

export function installPlugin(app: NodomApp, plugin: NodomPlugin, ...options: unknown[]): NodomApp {
    if (app.context.installedPlugins.has(plugin)) {
        return app;
    }
    app.context.installedPlugins.add(plugin);
    if (typeof plugin === "function") {
        plugin(app, ...options);
        return app;
    }
    if (plugin && typeof plugin.install === "function") {
        plugin.install(app, ...options);
        return app;
    }
    throw new TypeError("Invalid NodomX plugin. Expected a function or an object with install().");
}

export class App implements NodomApp {
    public readonly context: AppContext;
    public readonly config: AppContext["config"];
    public instance?: Module;

    constructor(
        public readonly rootComponent: UnknownClass,
        public selector?: string,
        seed?: AppContext
    ) {
        this.context = createAppContext(seed);
        this.context.app = this;
        this.config = this.context.config;
    }

    public mount(selector: string = this.selector as string): Module | undefined {
        const rootEl = selector ? document.querySelector(selector) : null;
        const target = (rootEl || Renderer.getRootEl() || document.body) as HTMLElement;
        Renderer.setRootEl(target);
        ModuleFactory.setAppContext(this.context);
        Scheduler.addTask(Renderer.render, Renderer);
        Scheduler.addTask(RequestManager.clearCache, RequestManager);
        Scheduler.start();
        const module = ModuleFactory.get(this.rootComponent) as Module | undefined;
        if (module) {
            ModuleFactory.setMain(module);
            module.active();
            this.instance = module;
            this.selector = selector;
            notifyDevtools(this, "mount");
        }
        return module;
    }

    public unmount(): this {
        if (this.instance) {
            notifyDevtools(this, "before-unmount");
            this.instance.destroy();
            if (Renderer.getRootEl()) {
                Renderer.getRootEl().innerHTML = "";
            }
            if (ModuleFactory.getMain() === this.instance) {
                ModuleFactory.setMain(undefined);
            }
            this.instance = undefined;
            notifyDevtools(this, "unmount");
        }
        return this;
    }

    public use(plugin: NodomPlugin, ...options: unknown[]): this {
        installPlugin(this, plugin, ...options);
        return this;
    }

    public component(name: string, clazz: UnknownClass): this {
        this.context.components.set(name.toLowerCase(), clazz);
        ModuleFactory.addClass(clazz, name);
        return this;
    }

    public directive(name: string, handler: DirectiveMethod, priority?: number): this {
        this.context.directives.set(name, { handler, priority });
        DirectiveManager.addType(name, handler, priority);
        return this;
    }

    public provide<T>(key: InjectionKey<T>, value: T): this {
        this.context.provides.set(key, value);
        return this;
    }
}

export function createApp(rootComponent: UnknownClass, selector?: string, seed?: AppContext): App {
    return new App(rootComponent, selector, seed);
}

function notifyDevtools(app: App, reason: string): void {
    const globalObject = typeof globalThis !== "undefined" ? globalThis : undefined;
    const windowObject = globalObject?.window as unknown as Record<string, unknown> | undefined;
    const globalRecord = globalObject as unknown as Record<string, unknown> | undefined;
    const hook = (windowObject?.["__NODOMX_DEVTOOLS_HOOK__"] || globalRecord?.["__NODOMX_DEVTOOLS_HOOK__"]) as DevtoolsHook | undefined;
    if (reason === "unmount" && hook && typeof hook.unregisterApp === "function") {
        hook.unregisterApp(app);
        return;
    }
    if (hook && typeof hook.notifyUpdate === "function") {
        hook.notifyUpdate(app, reason);
        return;
    }
    if (hook && reason === "mount" && typeof hook.registerApp === "function") {
        hook.registerApp(app);
        return;
    }
    if (hook && reason === "unmount" && typeof hook.unregisterApp === "function") {
        hook.unregisterApp(app);
    }
}

