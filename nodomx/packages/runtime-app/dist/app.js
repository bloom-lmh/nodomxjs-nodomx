import { createAppContext } from "@nodomx/shared";
import { DirectiveManager, ModuleFactory } from "@nodomx/runtime-registry";
import { Renderer } from "@nodomx/runtime-view";
import { RequestManager, Scheduler } from "@nodomx/runtime-scheduler";
export function installPlugin(app, plugin, ...options) {
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
export class App {
    constructor(rootComponent, selector, seed) {
        this.rootComponent = rootComponent;
        this.selector = selector;
        this.context = createAppContext(seed);
        this.context.app = this;
        this.config = this.context.config;
    }
    mount(selector = this.selector) {
        const rootEl = selector ? document.querySelector(selector) : null;
        const target = (rootEl || Renderer.getRootEl() || document.body);
        Renderer.setRootEl(target);
        ModuleFactory.setAppContext(this.context);
        Scheduler.addTask(Renderer.render, Renderer);
        Scheduler.addTask(RequestManager.clearCache, RequestManager);
        Scheduler.start();
        const module = ModuleFactory.get(this.rootComponent);
        if (module) {
            ModuleFactory.setMain(module);
            module.active();
            this.instance = module;
            this.selector = selector;
            notifyDevtools(this, "mount");
        }
        return module;
    }
    unmount() {
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
    use(plugin, ...options) {
        installPlugin(this, plugin, ...options);
        return this;
    }
    component(name, clazz) {
        this.context.components.set(name.toLowerCase(), clazz);
        ModuleFactory.addClass(clazz, name);
        return this;
    }
    directive(name, handler, priority) {
        this.context.directives.set(name, { handler, priority });
        DirectiveManager.addType(name, handler, priority);
        return this;
    }
    provide(key, value) {
        this.context.provides.set(key, value);
        return this;
    }
}
export function createApp(rootComponent, selector, seed) {
    return new App(rootComponent, selector, seed);
}
function notifyDevtools(app, reason) {
    const globalObject = typeof globalThis !== "undefined" ? globalThis : undefined;
    const windowObject = globalObject === null || globalObject === void 0 ? void 0 : globalObject.window;
    const globalRecord = globalObject;
    const hook = ((windowObject === null || windowObject === void 0 ? void 0 : windowObject["__NODOMX_DEVTOOLS_HOOK__"]) || (globalRecord === null || globalRecord === void 0 ? void 0 : globalRecord["__NODOMX_DEVTOOLS_HOOK__"]));
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
//# sourceMappingURL=app.js.map