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
    useState
} = await import("../dist/nodom.esm.js");

class ListDiffModule extends Module {
    template() {
        return `
            <div id="list-app">
                <button id="reverse" e-click="reverse">reverse</button>
                <ul id="todo-list">
                    <li x-repeat={{items}} key={{id}} data-id={{id}}>{{label}}</li>
                </ul>
            </div>
        `;
    }

    setup() {
        const items = useState([
            { id: "a", label: "alpha" },
            { id: "b", label: "beta" },
            { id: "c", label: "gamma" }
        ]);

        return {
            items,
            reverse() {
                items.value = [...items.value].reverse();
            }
        };
    }
}

function listItems() {
    return [...document.querySelectorAll("#todo-list li")];
}

Renderer.setRootEl(document.body);
const moduleInstance = ModuleFactory.get(ListDiffModule);
ModuleFactory.setMain(moduleInstance);
moduleInstance.active();
Renderer.flush();

const initialItems = listItems();
assert.deepEqual(initialItems.map(item => item.textContent?.trim()), ["alpha", "beta", "gamma"]);
assert.equal(initialItems[0].getAttribute("key"), null);

document.querySelector("#reverse").dispatchEvent(new window.Event("click", { bubbles: true }));
Renderer.flush();

const reversedItems = listItems();
assert.deepEqual(reversedItems.map(item => item.textContent?.trim()), ["gamma", "beta", "alpha"]);
assert.equal(reversedItems[0], initialItems[2]);
assert.equal(reversedItems[1], initialItems[1]);
assert.equal(reversedItems[2], initialItems[0]);

moduleInstance.destroy();

console.log("list diff smoke test passed");
