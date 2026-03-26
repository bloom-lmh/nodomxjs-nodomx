import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost/"
});

globalThis.window = window;
globalThis.document = window.document;
globalThis.history = window.history;
globalThis.location = window.location;
globalThis.navigator = window.navigator;
globalThis.Node = window.Node;
globalThis.Element = window.Element;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Comment = window.Comment;
globalThis.DocumentFragment = window.DocumentFragment;
globalThis.Event = window.Event;
globalThis.CustomEvent = window.CustomEvent;
globalThis.Text = window.Text;
globalThis.SVGElement = window.SVGElement;
globalThis.AbortController = window.AbortController;
globalThis.AbortSignal = window.AbortSignal;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const {
    Module,
    ModuleFactory,
    Nodom,
    Renderer,
    Router
} = await import("../dist/nodom.esm.js");

let lazyLoadCalls = 0;
let childLoadCalls = 0;

class ParentRouteModule extends Module {
    template() {
        return `
            <section id="parent-route">
                <div id="child-router" x-router></div>
            </section>
        `;
    }
}

class ChildRouteModule extends Module {
    template() {
        return `<p id="child-route-view">child-loaded</p>`;
    }
}

class LazyRouteModule extends Module {
    template() {
        return `<p id="lazy-route-view">lazy-loaded</p>`;
    }
}

class RouterRootModule extends Module {
    template() {
        return `
            <main id="router-root">
                <div id="root-router" x-router></div>
            </main>
        `;
    }
}

function text(selector) {
    return document.querySelector(selector)?.textContent?.trim();
}

async function tick() {
    await new Promise(resolve => setTimeout(resolve, 0));
}

Nodom.use(Router);

Nodom.createRoute([
    {
        path: "/parent",
        module: ParentRouteModule,
        children: [
            {
                path: "child",
                name: "child",
                load: async () => {
                    childLoadCalls++;
                    return ChildRouteModule;
                },
                preload: true
            }
        ]
    },
    {
        path: "/lazy",
        name: "lazy",
        load: async () => {
            lazyLoadCalls++;
            return LazyRouteModule;
        }
    }
]);

const router = Nodom["$Router"];

Renderer.setRootEl(document.body);
const appModule = ModuleFactory.get(RouterRootModule);
ModuleFactory.setMain(appModule);
appModule.active();
Renderer.flush();

const preloadLocation = await router.preload("/lazy");
assert.equal(preloadLocation.fullPath, "/lazy");
assert.equal(lazyLoadCalls, 1);

await router.preload("/lazy");
assert.equal(lazyLoadCalls, 1);

router.go("/parent");
await tick();
Renderer.flush();
await tick();
assert.equal(text("#parent-route"), "");
assert.equal(childLoadCalls, 1);

router.go("/parent/child");
await tick();
Renderer.flush();
await tick();
Renderer.flush();

assert.equal(childLoadCalls, 1);
assert.equal(text("#child-route-view"), "child-loaded");

appModule.destroy();

console.log("router preload smoke test passed");
