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
    Router,
    useComputed,
    useRoute
} = await import("../dist/nodom.esm.js");

const events = [];

class UserRouteModule extends Module {
    template() {
        return `
            <div id="user-route">{{routeSummary}}</div>
        `;
    }

    setup() {
        const route = useRoute();
        const routeSummary = useComputed(() => {
            return `${route.name}|${route.params.id}|${route.query.tab}|${route.hash}|${route.meta.section}`;
        });

        return {
            routeSummary
        };
    }
}

class RouterApp extends Module {
    template() {
        return `
            <div id="router-app">
                <a id="user-link" x-route="/users/42?tab=profile#bio" active="userActive">user</a>
                <p id="active">{{userActive}}</p>
                <div id="router-view" x-router></div>
            </div>
        `;
    }

    data() {
        return {
            userActive: false
        };
    }
}

function text(selector) {
    return document.querySelector(selector)?.textContent?.trim();
}

Nodom.use(Router);
const router = Nodom["$Router"];
router.beforeEach((to) => {
    events.push(`before:${to.fullPath}`);
});
router.afterEach((to) => {
    events.push(`after:${to.fullPath}`);
});

Nodom.createRoute([
    {
        path: "/home",
        redirect: "/users/42?tab=profile#bio"
    },
    {
        path: "/users/:id",
        name: "user",
        meta: {
            section: "account"
        },
        beforeEnter(to) {
            events.push(`enter:${to.params.id}`);
        },
        module: UserRouteModule
    }
]);

Renderer.setRootEl(document.body);
const appModule = ModuleFactory.get(RouterApp);
ModuleFactory.setMain(appModule);
appModule.active();
Renderer.flush();

router.go("/home");
await new Promise(resolve => setTimeout(resolve, 0));
Renderer.flush();

assert.equal(text("#user-route"), "user|42|profile|#bio|account");
assert.equal(text("#active"), "true");
assert.deepEqual(events, [
    "before:/users/42?tab=profile#bio",
    "enter:42",
    "after:/users/42?tab=profile#bio"
]);

const resolved = router.resolve("/users/9?tab=settings#card");
assert.equal(resolved.fullPath, "/users/9?tab=settings#card");
assert.equal(resolved.params.id, "9");
assert.equal(resolved.query.tab, "settings");
assert.equal(resolved.hash, "#card");
assert.equal(resolved.meta.section, "account");

appModule.destroy();

console.log("router smoke test passed");
