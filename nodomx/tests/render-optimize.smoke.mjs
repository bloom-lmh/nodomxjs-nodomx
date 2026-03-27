import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost/"
});

globalThis.window = window;
globalThis.document = window.document;
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
    Renderer,
    useReactive,
    useState
} = await import("../dist/nodom.esm.js");

let stableCalls = 0;
let staticBlockVisits = 0;
let staticLeafVisits = 0;

class RenderOptimizeModule extends Module {
    template() {
        return `
            <div id="optimize-root">
                <p id="count">{{count}}</p>
                <p id="stable">{{trackStable(profile.name)}}</p>
                <section id="static-shell" data-block="static-shell">
                    <span id="static-label" data-static-leaf="leaf">static</span>
                </section>
                <button id="inc" e-click="inc">inc</button>
                <button id="rename" e-click="rename">rename</button>
            </div>
        `;
    }

    setup() {
        const count = useState(1);
        const profile = useReactive({
            name: "alpha"
        });

        return {
            count,
            profile,
            trackStable(value) {
                stableCalls++;
                return value;
            },
            inc() {
                count.value++;
            },
            rename() {
                profile.name = "beta";
            }
        };
    }
}

function text(selector) {
    return document.querySelector(selector)?.textContent?.trim();
}

Renderer.setRootEl(document.body);
const originalRenderDom = Renderer.renderDom.bind(Renderer);
Renderer.renderDom = function patchedRenderDom(module, src, ...rest) {
    if (src?.getProp?.("data-block") === "static-shell") {
        staticBlockVisits++;
    }
    if (src?.getProp?.("data-static-leaf") === "leaf") {
        staticLeafVisits++;
    }
    return originalRenderDom(module, src, ...rest);
};
const moduleInstance = ModuleFactory.get(RenderOptimizeModule);
ModuleFactory.setMain(moduleInstance);
moduleInstance.active();
Renderer.flush();

assert.equal(text("#count"), "1");
assert.equal(text("#stable"), "alpha");
assert.equal(stableCalls, 1);
assert.equal(staticBlockVisits, 1);
assert.equal(staticLeafVisits, 1);

document.querySelector("#inc").dispatchEvent(new window.Event("click", { bubbles: true }));
Renderer.flush();

assert.equal(text("#count"), "2");
assert.equal(text("#stable"), "alpha");
assert.equal(stableCalls, 1);
assert.equal(staticBlockVisits, 1);
assert.equal(staticLeafVisits, 1);

document.querySelector("#rename").dispatchEvent(new window.Event("click", { bubbles: true }));
Renderer.flush();

assert.equal(text("#stable"), "beta");
assert.equal(stableCalls, 2);
assert.equal(staticBlockVisits, 1);
assert.equal(staticLeafVisits, 1);

Renderer.renderDom(moduleInstance, moduleInstance.domManager.vdomTree, moduleInstance.model);

assert.equal(staticLeafVisits, 1);

moduleInstance.destroy();
Renderer.renderDom = originalRenderDom;

console.log("render optimize smoke test passed");
