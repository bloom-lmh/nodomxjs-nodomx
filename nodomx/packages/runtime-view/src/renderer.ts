import { Expression } from "@nodomx/runtime-template";
import { VirtualDom } from "@nodomx/runtime-template";
import { Model } from "@nodomx/runtime-module";
import { Module } from "@nodomx/runtime-module";
import { ModuleFactory } from "@nodomx/runtime-registry";
import { Scheduler } from "@nodomx/runtime-scheduler";
import { ChangedDom, PatchFlags, RenderedDom } from "@nodomx/shared";
import { Util } from "@nodomx/shared";
import { CssManager } from "./cssmanager";
import { appendRenderedChild, canReuseRenderedSubtree, findPreviousChild, resolveRenderedKey, reuseRenderedDom } from "./reuse";

export class Renderer {
    private static rootEl: HTMLElement;
    private static waitList: Array<number | null> = [];
    private static waitSet: Set<number> = new Set();

    public static setRootEl(rootEl: HTMLElement): void {
        this.rootEl = rootEl;
    }

    public static getRootEl(): HTMLElement {
        return this.rootEl;
    }

    public static add(module: Module): void {
        if (!module || this.waitSet.has(module.id)) {
            return;
        }
        this.waitSet.add(module.id);
        this.waitList.push(module.id);
        Scheduler.request();
    }

    public static remove(module: Module): void {
        const index = this.waitList.indexOf(module.id);
        if (index !== -1) {
            this.waitList.splice(index, 1, null);
        }
        this.waitSet.delete(module.id);
    }

    public static render(): void {
        while (this.waitList.length > 0) {
            const id = this.waitList.shift();
            if (!id) {
                continue;
            }
            this.waitSet.delete(id);
            ModuleFactory.get(id)?.render();
        }
    }

    public static flush(maxRounds: number = 20): void {
        let rounds = 0;
        while (this.waitList.length > 0 && rounds < maxRounds) {
            this.render();
            rounds++;
        }
    }

    public static renderDom(
        module: Module,
        src: VirtualDom,
        model: Model,
        parent?: RenderedDom,
        key?: number | string,
        notRenderChild?: boolean,
        previousDom?: RenderedDom,
        dirtyPaths?: string[]
    ): RenderedDom {
        const srcModule = (ModuleFactory.get(src.moduleId as number) as Module | undefined) || module;
        const renderedKey = resolveRenderedKey(src, resolveNodeKey(src, srcModule, model, key));
        if (canReuseRenderedSubtree(src, previousDom, dirtyPaths)) {
            const reused = reuseRenderedDom(previousDom as RenderedDom, src, model, parent);
            reused.key = renderedKey;
            reused.moduleId = src.moduleId;
            reused.slotModuleId = src.slotModuleId;
            reused.staticNum = src.staticNum;
            reused.patchFlag = src.patchFlag;
            reused.dynamicProps = [...(src.dynamicProps || [])];
            reused.hoisted = src.hoisted;
            appendRenderedChild(parent, reused);
            return reused;
        }

        const dst: RenderedDom = {
            key: renderedKey,
            model,
            vdom: src,
            parent,
            moduleId: src.moduleId,
            slotModuleId: src.slotModuleId,
            staticNum: src.staticNum,
            patchFlag: src.patchFlag,
            dynamicProps: [...(src.dynamicProps || [])],
            hoisted: src.hoisted,
            __skipDiff: false
        };

        if (src.staticNum > 0) {
            src.staticNum--;
        }

        if (src.tagName) {
            dst.tagName = src.tagName;
            dst.locMap = new Map();
            dst.props = {};
            if (src.isSvg) {
                dst.isSvg = src.isSvg;
            }
        }

        const modelDirective = src.getDirective("model");
        if (modelDirective) {
            modelDirective.exec(module, dst);
        }

        if (dst.tagName) {
            this.handleProps(module, src, dst, srcModule as Module);
            if (src.tagName === "style") {
                CssManager.handleStyleDom(module, dst);
            } else if (src.assets && src.assets.size > 0) {
                dst.assets ||= {};
                for (const asset of src.assets) {
                    dst.assets[asset[0]] = asset[1];
                }
            }
            if (!this.handleDirectives(module, src, dst)) {
                return null;
            }
            if (src.events) {
                dst.events = [...src.events];
            }
            if (!notRenderChild && src.children && src.children.length > 0) {
                dst.children = [];
                for (const child of src.children) {
                    const previousChild = findPreviousChild(previousDom, child, key);
                    this.renderDom(module, child, dst.model as Model, dst, key, false, previousChild, dirtyPaths);
                }
            }
        } else if (src.expressions) {
            let value = "";
            for (const expr of src.expressions) {
                if (expr instanceof Expression) {
                    const nextValue = expr.val(srcModule as Module, dst.model as Model);
                    value += nextValue !== undefined && nextValue !== null ? nextValue : "";
                } else {
                    value += expr;
                }
            }
            dst.textContent = value;
        } else {
            dst.textContent = src.textContent;
        }

        appendRenderedChild(parent, dst);
        return dst;
    }

    private static handleDirectives(module: Module, src: VirtualDom, dst: RenderedDom): boolean {
        if (!src.directives || src.directives.length === 0) {
            return true;
        }
        for (const directive of src.directives) {
            if (directive.type.name === "model") {
                continue;
            }
            if (!directive.exec(module, dst)) {
                return false;
            }
        }
        return true;
    }

    private static handleProps(module: Module, src: VirtualDom, dst: RenderedDom, srcModule: Module): void {
        if (src.props?.size > 0) {
            for (const prop of src.props) {
                if (prop[0] === "key") {
                    continue;
                }
                const value = prop[1] instanceof Expression ? prop[1].val(srcModule, dst.model as Model) : prop[1];
                dst.props![prop[0]] = normalizePropValue(value);
            }
        }
        if (src.key === 1) {
            mergeRootProps(module, dst);
        }
    }

    public static updateToHtml(module: Module, dom: RenderedDom, oldDom: RenderedDom): Node {
        const el = oldDom.node;
        if (!el) {
            dom.node = this.renderToHtml(module, dom, oldDom.parent?.node as Node);
            return dom.node as Node;
        }
        dom.node = el;
        if (dom.tagName) {
            syncDomState(module, dom, oldDom, el);
        } else {
            (el as Text).textContent = dom.textContent as string;
        }
        return el;
    }

    public static renderToHtml(module: Module, src: RenderedDom, parentEl: Node | null): Node {
        const el = src.tagName ? createElementNode(src) : createTextNode(src);
        if (el && src.tagName && !src.childModuleId) {
            appendChildren(el, src);
        }
        if (el && parentEl) {
            parentEl.appendChild(el);
        }
        return el as Node;

        function createElementNode(dom: RenderedDom): Node | undefined {
            if (dom.childModuleId) {
                const childModule = ModuleFactory.get(dom.childModuleId);
                if (childModule) {
                    const comment = document.createComment(`module ${childModule.constructor.name}:${childModule.id}`);
                    Renderer.add(childModule);
                    dom.node = comment;
                    return comment;
                }
                return;
            }
            let el: Element;
            if (dom.tagName === "style") {
                el = document.createElement("style");
            } else if (dom.isSvg) {
                el = document.createElementNS("http://www.w3.org/2000/svg", dom.tagName as string);
                if (dom.tagName === "svg") {
                    el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                }
            } else {
                el = document.createElement(dom.tagName as string);
            }
            dom.node = el;
            if (dom.props) {
                for (const prop of Object.keys(dom.props)) {
                    el.setAttribute(prop, dom.props[prop] as string);
                }
            }
            if (dom.assets) {
                for (const asset of Object.keys(dom.assets)) {
                    (el as unknown as Record<string, unknown>)[asset] = dom.assets[asset];
                }
            }
            module.eventFactory.handleDomEvent(dom);
            return el;
        }

        function createTextNode(dom: RenderedDom): Node | undefined {
            if (CssManager.handleStyleTextDom(module, dom)) {
                return;
            }
            dom.node = document.createTextNode((dom.textContent as string) || "");
            return dom.node;
        }

        function appendChildren(parentNode: Node, dom: RenderedDom): void {
            if (!dom.children || dom.children.length === 0) {
                return;
            }
            for (const child of dom.children) {
                let childNode: Node | undefined;
                if (child.tagName) {
                    childNode = createElementNode(child);
                    if (childNode instanceof Element) {
                        appendChildren(childNode, child);
                    }
                } else {
                    childNode = createTextNode(child);
                }
                if (childNode) {
                    parentNode.appendChild(childNode);
                }
            }
        }
    }

    public static handleChangedDoms(module: Module, changeDoms: ChangedDom[]): void {
        const slotDoms: Record<string, ChangedDom[]> = {};
        const replaceList: ChangedDom[] = [];
        const addOrMove: ChangedDom[] = [];

        for (const item of changeDoms) {
            if (item[1].slotModuleId && item[1].slotModuleId !== module.id) {
                const slotKey = String(item[1].slotModuleId);
                slotDoms[slotKey] ||= [];
                slotDoms[slotKey].push(item);
                continue;
            }
            switch (item[0]) {
                case 1:
                case 4:
                    addOrMove.push(item);
                    break;
                case 2:
                    if (item[1].childModuleId) {
                        Renderer.add(ModuleFactory.get(item[1].childModuleId) as Module);
                    } else {
                        this.updateToHtml(module, item[1], item[2] as RenderedDom);
                    }
                    break;
                case 3:
                    module.domManager.freeNode(item[1], true);
                    break;
                default:
                    replaceList.push(item);
            }
        }

        for (const item of replaceList) {
            this.replace(module, item[1], item[2] as RenderedDom);
        }

        if (addOrMove.length > 1) {
            addOrMove.sort((left, right) => ((left[4] as number) > (right[4] as number) ? 1 : -1));
        }

        while (addOrMove.length > 0) {
            const item = addOrMove.shift() as ChangedDom;
            const parentNode = item[3]?.node as Node;
            if (!parentNode) {
                continue;
            }
            const node = item[0] === 1 ? Renderer.renderToHtml(module, item[1], null) : item[1].node;
            if (!node) {
                continue;
            }
            let index = item[4] as number;
            const offset = addOrMove.filter(change =>
                change[0] === 4
                && change[3]?.node === parentNode
                && (change[4] as number) >= index
                && (change[5] as number) < index
            ).length;
            moveNode(node, parentNode, index + offset);
        }

        for (const key of Object.keys(slotDoms)) {
            const slotModule = ModuleFactory.get(parseInt(key, 10));
            if (slotModule) {
                Renderer.add(slotModule);
            }
        }

        function moveNode(node: Node, parentNode: Node, loc: number): void {
            const moduleNode = findModuleNode(node);
            let inserted = false;
            for (let i = 0, index = 0; i < parentNode.childNodes.length; i++, index++) {
                const current = parentNode.childNodes[i];
                if (findModuleNode(current) !== null) {
                    i++;
                }
                if (index !== loc) {
                    continue;
                }
                if (moduleNode === null) {
                    parentNode.insertBefore(node, current);
                } else {
                    parentNode.insertBefore(moduleNode, current);
                    parentNode.insertBefore(node, moduleNode);
                }
                inserted = true;
                break;
            }
            if (inserted) {
                return;
            }
            if (moduleNode === null) {
                parentNode.appendChild(node);
            } else {
                parentNode.appendChild(node);
                parentNode.appendChild(moduleNode);
            }
        }

        function findModuleNode(node: Node | null): Node | null {
            return node
                && node instanceof Comment
                && node.nextSibling
                && node.nextSibling instanceof Element
                && node.textContent?.endsWith(node.nextSibling.getAttribute("role") || "")
                ? node.nextSibling
                : null;
        }
    }

    private static replace(module: Module, src: RenderedDom, dst: RenderedDom): void {
        const el = this.renderToHtml(module, src, null);
        if (dst.childModuleId) {
            const childModule = ModuleFactory.get(dst.childModuleId) as Module;
            const parentEl = childModule?.srcDom?.node?.parentElement;
            if (!parentEl) {
                return;
            }
            const previousSibling = childModule.srcDom.node?.previousSibling as Node | undefined;
            childModule.destroy();
            if (previousSibling) {
                Util.insertAfter(el, previousSibling);
            } else if (parentEl.childNodes.length === 0) {
                parentEl.appendChild(el);
            } else {
                parentEl.insertBefore(el, parentEl.childNodes[0]);
            }
            return;
        }
        const parentEl = dst.node?.parentElement;
        if (!parentEl || !dst.node) {
            return;
        }
        parentEl.replaceChild(el, dst.node);
        module.domManager.freeNode(dst, true);
    }
}

function normalizePropValue(value: unknown): unknown {
    return value === undefined
        || value === null
        || value === ""
        || (typeof value === "string" && value.trim() === "")
        ? ""
        : value;
}

function mergeRootProps(module: Module, dom: RenderedDom): void {
    if (!module.props) {
        return;
    }
    for (const key of Object.keys(module.props)) {
        if (module.excludedProps?.includes(key)) {
            continue;
        }
        let value = dom.props?.[key];
        let nextValue = module.props[key];
        if (typeof nextValue === "string") {
            nextValue = nextValue.trim();
        }
        if (!nextValue) {
            dom.props![key] = normalizePropValue(value);
            continue;
        }
        if (key === "style") {
            value = value ? `${nextValue};${value}`.replace(/;{2,}/g, ";") : nextValue;
        } else if (key === "class") {
            value = value ? `${value} ${nextValue}` : nextValue;
        } else if (!value) {
            value = nextValue;
        }
        dom.props![key] = normalizePropValue(value);
    }
}

function resolveNodeKey(
    src: VirtualDom,
    srcModule: Module,
    model: Model,
    fallbackKey?: number | string
): number | string | undefined {
    const keyProp = src.getProp("key");
    if (keyProp instanceof Expression) {
        const resolved = keyProp.val(srcModule, model);
        if (resolved !== undefined && resolved !== null && resolved !== "") {
            return resolved as number | string;
        }
    } else if (keyProp !== undefined && keyProp !== null && keyProp !== "") {
        return keyProp as number | string;
    }
    return fallbackKey;
}

function syncDomState(module: Module, dom: RenderedDom, oldDom: RenderedDom, el: Node): void {
    const patchFlag = dom.patchFlag ?? oldDom.patchFlag ?? PatchFlags.BAIL;
    if (!isTargetedPatch(patchFlag)) {
        syncProps(el as HTMLElement, dom.props, oldDom.props);
        syncAssets(el, dom.assets, oldDom.assets);
        module.eventFactory.handleDomEvent(dom, oldDom);
        return;
    }

    if (patchFlag & PatchFlags.CLASS) {
        syncNamedProp(el as HTMLElement, "class", dom.props, oldDom.props);
    }
    if (patchFlag & PatchFlags.STYLE) {
        syncNamedProp(el as HTMLElement, "style", dom.props, oldDom.props);
    }
    if (patchFlag & PatchFlags.PROPS) {
        for (const key of dom.dynamicProps || []) {
            syncNamedProp(el as HTMLElement, key, dom.props, oldDom.props);
        }
    }
    if (patchFlag & PatchFlags.ASSETS) {
        for (const key of dom.dynamicProps || []) {
            syncNamedAsset(el, key, dom.assets, oldDom.assets);
        }
    }
    if (patchFlag & PatchFlags.EVENTS) {
        module.eventFactory.handleDomEvent(dom, oldDom);
    }
}

function isTargetedPatch(flag: PatchFlags): boolean {
    if (!flag || (flag & PatchFlags.BAIL) !== 0 || (flag & PatchFlags.DIRECTIVES) !== 0) {
        return false;
    }
    return true;
}

function syncProps(
    el: HTMLElement,
    nextProps?: Record<string, unknown>,
    prevProps?: Record<string, unknown>
): void {
    if (nextProps) {
        for (const key of Object.keys(nextProps)) {
            el.setAttribute(key, String(nextProps[key] ?? ""));
            if (prevProps) {
                delete prevProps[key];
            }
        }
    }
    if (prevProps) {
        for (const key of Object.keys(prevProps)) {
            el.removeAttribute(key);
        }
    }
}

function syncAssets(
    el: Node,
    nextAssets?: Record<string, unknown>,
    prevAssets?: Record<string, unknown>
): void {
    if (nextAssets) {
        for (const key of Object.keys(nextAssets)) {
            (el as unknown as Record<string, unknown>)[key] = nextAssets[key];
            if (prevAssets) {
                delete prevAssets[key];
            }
        }
    }
    if (prevAssets) {
        for (const key of Object.keys(prevAssets)) {
            (el as unknown as Record<string, unknown>)[key] = null;
        }
    }
}

function syncNamedProp(
    el: HTMLElement,
    key: string,
    nextProps?: Record<string, unknown>,
    prevProps?: Record<string, unknown>
): void {
    const nextValue = nextProps?.[key];
    const prevValue = prevProps?.[key];
    if (nextValue === prevValue) {
        return;
    }
    if (nextValue === undefined || nextValue === null || nextValue === "") {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, String(nextValue));
    }
}

function syncNamedAsset(
    el: Node,
    key: string,
    nextAssets?: Record<string, unknown>,
    prevAssets?: Record<string, unknown>
): void {
    const nextValue = nextAssets?.[key];
    const prevValue = prevAssets?.[key];
    if (nextValue === prevValue) {
        return;
    }
    (el as unknown as Record<string, unknown>)[key] = nextValue === undefined ? null : nextValue;
}

