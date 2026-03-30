import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { Nodom, Module, useState } from "nodomx";
import {
    createDevtools,
    getDevtoolsHook,
    installDevtoolsHook
} from "../src/index.js";

const dom = new JSDOM("<!doctype html><html><body><div id=\"app\"></div></body></html>", {
    url: "http://localhost/"
});

installGlobals(dom.window);

class CounterApp extends Module {
    template() {
        return `
            <section class="app-shell">
                <p>{{count}}</p>
                <button e-click="inc">+</button>
            </section>
        `;
    }

    setup() {
        const count = useState(1);
        return {
            count,
            inc() {
                count.value += 1;
            }
        };
    }
}

const hook = installDevtoolsHook({
    overlay: true
});
const app = Nodom.createApp(CounterApp, "#app");
app.use(createDevtools({
    overlay: true
}));
const instance = app.mount("#app");
hook.notifyUpdate(app, "mount");

assert.ok(instance, "expected mounted NodomX app");

const snapshots = hook.getSnapshot();
assert.equal(snapshots.length, 1, "expected one mounted app in devtools");
assert.equal(snapshots[0].snapshot.name, "CounterApp");
assert.equal(snapshots[0].snapshot.rootModule.setup.count, 1);

instance.inc();
hook.notifyUpdate(app, "manual-refresh");
const updated = hook.getSnapshot()[0];
assert.equal(updated.lastEvent, "manual-refresh");
assert.equal(updated.snapshot.rootModule.setup.count, 2);

const panel = getDevtoolsHook().openOverlay();
assert.ok(panel, "expected overlay panel");
assert.ok(document.querySelector("[data-nodomx-devtools]"), "expected overlay root in document");

app.unmount();
hook.unregisterApp(app);
assert.equal(hook.getSnapshot().length, 0, "expected no mounted apps after unmount");

dom.window.close();
console.log("@nodomx/devtools smoke test passed");

function installGlobals(windowRef) {
    globalThis.window = windowRef;
    globalThis.document = windowRef.document;
    globalThis.navigator = windowRef.navigator;
    globalThis.Node = windowRef.Node;
    globalThis.Element = windowRef.Element;
    globalThis.HTMLElement = windowRef.HTMLElement;
    globalThis.Comment = windowRef.Comment;
    globalThis.DocumentFragment = windowRef.DocumentFragment;
    globalThis.Event = windowRef.Event;
    globalThis.CustomEvent = windowRef.CustomEvent;
    globalThis.Text = windowRef.Text;
    globalThis.SVGElement = windowRef.SVGElement;
    globalThis.getComputedStyle = windowRef.getComputedStyle.bind(windowRef);
    globalThis.requestAnimationFrame = callback => setTimeout(() => callback(Date.now()), 0);
    globalThis.cancelAnimationFrame = id => clearTimeout(id);
}
