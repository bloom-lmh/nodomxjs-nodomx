import { Renderer } from "@nodomx/runtime-view";
import { Module } from "./module";
import { Model } from "./model";
import { Watcher } from "./wacher";

export class ModelManager {
    private static shareModelMap: Map<Model, Module[]> = new Map();

    public static addShareModel(model: Model, module: Module) {
        if (!this.shareModelMap.has(model)) {
            this.shareModelMap.set(model, [model["__module"], module]);
            return;
        }
        const arr = this.shareModelMap.get(model);
        if (arr.indexOf(module) === -1) {
            arr.push(module);
        }
    }

    public static getModule(model: Model): Module | Module[] {
        if (this.shareModelMap.has(model)) {
            return this.shareModelMap.get(model);
        }
        return model["__module"];
    }

    public static update(model, key, oldValue, newValue) {
        const dirtyPath = this.getDirtyPath(model, key);
        if (this.shareModelMap.size > 0) {
            for (let current = model; current; current = current["__parent"]) {
                if (!this.shareModelMap.has(current)) {
                    continue;
                }
                for (const module of this.shareModelMap.get(current)) {
                    module.markDirty();
                    Renderer.add(module);
                }
                Watcher.handle(model, key, oldValue, newValue);
                return;
            }
        }
        const module = model["__module"] as Module;
        if (module) {
            module.markDirty(dirtyPath);
            Renderer.add(module);
        }
        Watcher.handle(model, key, oldValue, newValue);
    }

    public static get(model: Model, key?: string): unknown {
        if (key) {
            if (key.indexOf(".") !== -1) {
                const arr = key.split(".");
                for (let i = 0; i < arr.length - 1; i++) {
                    model = model[arr[i]];
                    if (!model) {
                        break;
                    }
                }
                if (!model) {
                    return;
                }
                key = arr[arr.length - 1];
            }
            model = model[key];
        }
        return model;
    }

    public static set(model: Model, key: string, value: unknown) {
        if (key.includes(".")) {
            const arr = key.split(".");
            for (let i = 0; i < arr.length - 1; i++) {
                if (!model[arr[i]]) {
                    model[arr[i]] = {};
                }
                model = model[arr[i]];
            }
            key = arr[arr.length - 1];
        }
        model[key] = value;
    }

    private static getDirtyPath(model: Model, key: string | symbol): string | undefined {
        if (typeof key === "symbol") {
            return;
        }
        const parts = [key];
        for (let current = model; current; current = current["__parent"]) {
            const name = current["__name"];
            if (typeof name === "string" && name !== "") {
                parts.unshift(name);
            }
        }
        return parts.join(".");
    }
}

