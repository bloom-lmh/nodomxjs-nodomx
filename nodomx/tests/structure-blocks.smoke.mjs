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
    Compiler,
    Module,
    ModuleFactory,
    StructureFlags
} = await import("../dist/nodom.esm.js");

class ChildPanel extends Module {
    template() {
        return `<div id="child-panel">child panel</div>`;
    }
}

class StructuralBlocksModule extends Module {
    modules = [ChildPanel];

    template() {
        return `
            <section id="structure-root">
                <header id="static-leaf">static</header>
                <if cond={{visible}}>
                    <div id="branch-a">{{title}}</div>
                </if>
                <elseif cond={{fallback}}>
                    <div id="branch-b">fallback</div>
                </elseif>
                <else>
                    <div id="branch-c">other</div>
                </else>
                <endif />
                <slot name="actions">
                    <button id="slot-action">slot action</button>
                </slot>
                <module name="ChildPanel" />
                <route path="/dashboard">dashboard</route>
                <router />
            </section>
        `;
    }

    data() {
        return {
            fallback: false,
            title: "hello",
            visible: true
        };
    }
}

const moduleInstance = ModuleFactory.get(StructuralBlocksModule);
const tree = new Compiler(moduleInstance).compile(moduleInstance.template());
const children = tree.children || [];

assert.equal(children.length, 9);
assert.equal(tree.blockTree, true);

const dynamicIndexes = new Set(tree.dynamicChildIndexes);
assert.equal(dynamicIndexes.has(0), false);
assert.equal(dynamicIndexes.has(1), true);
assert.equal(dynamicIndexes.has(2), true);
assert.equal(dynamicIndexes.has(3), true);
assert.equal(dynamicIndexes.has(4), false);
assert.equal(dynamicIndexes.has(5), true);
assert.equal(dynamicIndexes.has(6), true);
assert.equal(dynamicIndexes.has(7), true);
assert.equal(dynamicIndexes.has(8), true);

const [
    staticLeaf,
    ifNode,
    elseifNode,
    elseNode,
    endifNode,
    slotNode,
    moduleNode,
    routeNode,
    routerNode
] = children;

assert.equal(staticLeaf.structureFlags, StructureFlags.NONE);
assert.notEqual(ifNode.structureFlags & StructureFlags.CONDITIONAL, 0);
assert.notEqual(elseifNode.structureFlags & StructureFlags.CONDITIONAL, 0);
assert.notEqual(elseNode.structureFlags & StructureFlags.CONDITIONAL, 0);
assert.equal(endifNode.structureFlags, StructureFlags.NONE);
assert.notEqual(slotNode.structureFlags & StructureFlags.SLOT, 0);
assert.notEqual(moduleNode.structureFlags & StructureFlags.MODULE, 0);
assert.notEqual(routeNode.structureFlags & StructureFlags.ROUTE_LINK, 0);
assert.notEqual(routerNode.structureFlags & StructureFlags.ROUTE_VIEW, 0);
assert.equal(routeNode.tagName, "a");

const expectedFlags = StructureFlags.CONDITIONAL
    | StructureFlags.SLOT
    | StructureFlags.MODULE
    | StructureFlags.ROUTE_LINK
    | StructureFlags.ROUTE_VIEW;

assert.equal((tree.childrenStructureFlags & expectedFlags) === expectedFlags, true);

moduleInstance.destroy();

console.log("structure blocks smoke test passed");
