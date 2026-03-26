import { Expression } from "@nodomx/runtime-template";
import { ModuleFactory } from "@nodomx/runtime-registry";
import { Scheduler } from "@nodomx/runtime-scheduler";
import { PatchFlags } from "@nodomx/shared";
import { Util } from "@nodomx/shared";
import { CssManager } from "./cssmanager";
import { appendRenderedChild, canReuseRenderedSubtree, findPreviousChild, resolveRenderedKey, reuseRenderedDom } from "./reuse";
export class Renderer {
    static setRootEl(rootEl) {
        this.rootEl = rootEl;
    }
    static getRootEl() {
        return this.rootEl;
    }
    static add(module) {
        if (!module || this.waitSet.has(module.id)) {
            return;
        }
        this.waitSet.add(module.id);
        this.waitList.push(module.id);
        Scheduler.request();
    }
    static remove(module) {
        const index = this.waitList.indexOf(module.id);
        if (index !== -1) {
            this.waitList.splice(index, 1, null);
        }
        this.waitSet.delete(module.id);
    }
    static render() {
        var _a;
        while (this.waitList.length > 0) {
            const id = this.waitList.shift();
            if (!id) {
                continue;
            }
            this.waitSet.delete(id);
            (_a = ModuleFactory.get(id)) === null || _a === void 0 ? void 0 : _a.render();
        }
    }
    static flush(maxRounds = 20) {
        let rounds = 0;
        while (this.waitList.length > 0 && rounds < maxRounds) {
            this.render();
            rounds++;
        }
    }
    static renderDom(module, src, model, parent, key, notRenderChild, previousDom, dirtyPaths) {
        const srcModule = ModuleFactory.get(src.moduleId) || module;
        const renderedKey = resolveRenderedKey(src, resolveNodeKey(src, srcModule, model, key));
        if (canReuseRenderedSubtree(src, previousDom, dirtyPaths)) {
            const reused = reuseRenderedDom(previousDom, src, model, parent);
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
        const dst = {
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
            this.handleProps(module, src, dst, srcModule);
            if (src.tagName === "style") {
                CssManager.handleStyleDom(module, dst);
            }
            else if (src.assets && src.assets.size > 0) {
                dst.assets || (dst.assets = {});
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
                    this.renderDom(module, child, dst.model, dst, key, false, previousChild, dirtyPaths);
                }
            }
        }
        else if (src.expressions) {
            let value = "";
            for (const expr of src.expressions) {
                if (expr instanceof Expression) {
                    const nextValue = expr.val(srcModule, dst.model);
                    value += nextValue !== undefined && nextValue !== null ? nextValue : "";
                }
                else {
                    value += expr;
                }
            }
            dst.textContent = value;
        }
        else {
            dst.textContent = src.textContent;
        }
        appendRenderedChild(parent, dst);
        return dst;
    }
    static handleDirectives(module, src, dst) {
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
    static handleProps(module, src, dst, srcModule) {
        var _a;
        if (((_a = src.props) === null || _a === void 0 ? void 0 : _a.size) > 0) {
            for (const prop of src.props) {
                if (prop[0] === "key") {
                    continue;
                }
                const value = prop[1] instanceof Expression ? prop[1].val(srcModule, dst.model) : prop[1];
                dst.props[prop[0]] = normalizePropValue(value);
            }
        }
        if (src.key === 1) {
            mergeRootProps(module, dst);
        }
    }
    static updateToHtml(module, dom, oldDom) {
        var _a;
        const el = oldDom.node;
        if (!el) {
            dom.node = this.renderToHtml(module, dom, (_a = oldDom.parent) === null || _a === void 0 ? void 0 : _a.node);
            return dom.node;
        }
        dom.node = el;
        if (dom.tagName) {
            syncDomState(module, dom, oldDom, el);
        }
        else {
            el.textContent = dom.textContent;
        }
        return el;
    }
    static renderToHtml(module, src, parentEl) {
        const el = src.tagName ? createElementNode(src) : createTextNode(src);
        if (el && src.tagName && !src.childModuleId) {
            appendChildren(el, src);
        }
        if (el && parentEl) {
            parentEl.appendChild(el);
        }
        return el;
        function createElementNode(dom) {
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
            let el;
            if (dom.tagName === "style") {
                el = document.createElement("style");
            }
            else if (dom.isSvg) {
                el = document.createElementNS("http://www.w3.org/2000/svg", dom.tagName);
                if (dom.tagName === "svg") {
                    el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                }
            }
            else {
                el = document.createElement(dom.tagName);
            }
            dom.node = el;
            if (dom.props) {
                for (const prop of Object.keys(dom.props)) {
                    el.setAttribute(prop, dom.props[prop]);
                }
            }
            if (dom.assets) {
                for (const asset of Object.keys(dom.assets)) {
                    el[asset] = dom.assets[asset];
                }
            }
            module.eventFactory.handleDomEvent(dom);
            return el;
        }
        function createTextNode(dom) {
            if (CssManager.handleStyleTextDom(module, dom)) {
                return;
            }
            dom.node = document.createTextNode(dom.textContent || "");
            return dom.node;
        }
        function appendChildren(parentNode, dom) {
            if (!dom.children || dom.children.length === 0) {
                return;
            }
            for (const child of dom.children) {
                let childNode;
                if (child.tagName) {
                    childNode = createElementNode(child);
                    if (childNode instanceof Element) {
                        appendChildren(childNode, child);
                    }
                }
                else {
                    childNode = createTextNode(child);
                }
                if (childNode) {
                    parentNode.appendChild(childNode);
                }
            }
        }
    }
    static handleChangedDoms(module, changeDoms) {
        var _a;
        const slotDoms = {};
        const replaceList = [];
        const addOrMove = [];
        for (const item of changeDoms) {
            if (item[1].slotModuleId && item[1].slotModuleId !== module.id) {
                const slotKey = String(item[1].slotModuleId);
                slotDoms[slotKey] || (slotDoms[slotKey] = []);
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
                        Renderer.add(ModuleFactory.get(item[1].childModuleId));
                    }
                    else {
                        this.updateToHtml(module, item[1], item[2]);
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
            this.replace(module, item[1], item[2]);
        }
        if (addOrMove.length > 1) {
            addOrMove.sort((left, right) => (left[4] > right[4] ? 1 : -1));
        }
        while (addOrMove.length > 0) {
            const item = addOrMove.shift();
            const parentNode = (_a = item[3]) === null || _a === void 0 ? void 0 : _a.node;
            if (!parentNode) {
                continue;
            }
            const node = item[0] === 1 ? Renderer.renderToHtml(module, item[1], null) : item[1].node;
            if (!node) {
                continue;
            }
            let index = item[4];
            const offset = addOrMove.filter(change => {
                var _a;
                return change[0] === 4
                    && ((_a = change[3]) === null || _a === void 0 ? void 0 : _a.node) === parentNode
                    && change[4] >= index
                    && change[5] < index;
            }).length;
            moveNode(node, parentNode, index + offset);
        }
        for (const key of Object.keys(slotDoms)) {
            const slotModule = ModuleFactory.get(parseInt(key, 10));
            if (slotModule) {
                Renderer.add(slotModule);
            }
        }
        function moveNode(node, parentNode, loc) {
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
                }
                else {
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
            }
            else {
                parentNode.appendChild(node);
                parentNode.appendChild(moduleNode);
            }
        }
        function findModuleNode(node) {
            var _a;
            return node
                && node instanceof Comment
                && node.nextSibling
                && node.nextSibling instanceof Element
                && ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.endsWith(node.nextSibling.getAttribute("role") || ""))
                ? node.nextSibling
                : null;
        }
    }
    static replace(module, src, dst) {
        var _a, _b, _c, _d;
        const el = this.renderToHtml(module, src, null);
        if (dst.childModuleId) {
            const childModule = ModuleFactory.get(dst.childModuleId);
            const parentEl = (_b = (_a = childModule === null || childModule === void 0 ? void 0 : childModule.srcDom) === null || _a === void 0 ? void 0 : _a.node) === null || _b === void 0 ? void 0 : _b.parentElement;
            if (!parentEl) {
                return;
            }
            const previousSibling = (_c = childModule.srcDom.node) === null || _c === void 0 ? void 0 : _c.previousSibling;
            childModule.destroy();
            if (previousSibling) {
                Util.insertAfter(el, previousSibling);
            }
            else if (parentEl.childNodes.length === 0) {
                parentEl.appendChild(el);
            }
            else {
                parentEl.insertBefore(el, parentEl.childNodes[0]);
            }
            return;
        }
        const parentEl = (_d = dst.node) === null || _d === void 0 ? void 0 : _d.parentElement;
        if (!parentEl || !dst.node) {
            return;
        }
        parentEl.replaceChild(el, dst.node);
        module.domManager.freeNode(dst, true);
    }
}
Renderer.waitList = [];
Renderer.waitSet = new Set();
function normalizePropValue(value) {
    return value === undefined
        || value === null
        || value === ""
        || (typeof value === "string" && value.trim() === "")
        ? ""
        : value;
}
function mergeRootProps(module, dom) {
    var _a, _b;
    if (!module.props) {
        return;
    }
    for (const key of Object.keys(module.props)) {
        if ((_a = module.excludedProps) === null || _a === void 0 ? void 0 : _a.includes(key)) {
            continue;
        }
        let value = (_b = dom.props) === null || _b === void 0 ? void 0 : _b[key];
        let nextValue = module.props[key];
        if (typeof nextValue === "string") {
            nextValue = nextValue.trim();
        }
        if (!nextValue) {
            dom.props[key] = normalizePropValue(value);
            continue;
        }
        if (key === "style") {
            value = value ? `${nextValue};${value}`.replace(/;{2,}/g, ";") : nextValue;
        }
        else if (key === "class") {
            value = value ? `${value} ${nextValue}` : nextValue;
        }
        else if (!value) {
            value = nextValue;
        }
        dom.props[key] = normalizePropValue(value);
    }
}
function resolveNodeKey(src, srcModule, model, fallbackKey) {
    const keyProp = src.getProp("key");
    if (keyProp instanceof Expression) {
        const resolved = keyProp.val(srcModule, model);
        if (resolved !== undefined && resolved !== null && resolved !== "") {
            return resolved;
        }
    }
    else if (keyProp !== undefined && keyProp !== null && keyProp !== "") {
        return keyProp;
    }
    return fallbackKey;
}
function syncDomState(module, dom, oldDom, el) {
    var _a, _b;
    const patchFlag = (_b = (_a = dom.patchFlag) !== null && _a !== void 0 ? _a : oldDom.patchFlag) !== null && _b !== void 0 ? _b : PatchFlags.BAIL;
    if (!isTargetedPatch(patchFlag)) {
        syncProps(el, dom.props, oldDom.props);
        syncAssets(el, dom.assets, oldDom.assets);
        module.eventFactory.handleDomEvent(dom, oldDom);
        return;
    }
    if (patchFlag & PatchFlags.CLASS) {
        syncNamedProp(el, "class", dom.props, oldDom.props);
    }
    if (patchFlag & PatchFlags.STYLE) {
        syncNamedProp(el, "style", dom.props, oldDom.props);
    }
    if (patchFlag & PatchFlags.PROPS) {
        for (const key of dom.dynamicProps || []) {
            syncNamedProp(el, key, dom.props, oldDom.props);
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
function isTargetedPatch(flag) {
    if (!flag || (flag & PatchFlags.BAIL) !== 0 || (flag & PatchFlags.DIRECTIVES) !== 0) {
        return false;
    }
    return true;
}
function syncProps(el, nextProps, prevProps) {
    var _a;
    if (nextProps) {
        for (const key of Object.keys(nextProps)) {
            el.setAttribute(key, String((_a = nextProps[key]) !== null && _a !== void 0 ? _a : ""));
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
function syncAssets(el, nextAssets, prevAssets) {
    if (nextAssets) {
        for (const key of Object.keys(nextAssets)) {
            el[key] = nextAssets[key];
            if (prevAssets) {
                delete prevAssets[key];
            }
        }
    }
    if (prevAssets) {
        for (const key of Object.keys(prevAssets)) {
            el[key] = null;
        }
    }
}
function syncNamedProp(el, key, nextProps, prevProps) {
    const nextValue = nextProps === null || nextProps === void 0 ? void 0 : nextProps[key];
    const prevValue = prevProps === null || prevProps === void 0 ? void 0 : prevProps[key];
    if (nextValue === prevValue) {
        return;
    }
    if (nextValue === undefined || nextValue === null || nextValue === "") {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, String(nextValue));
    }
}
function syncNamedAsset(el, key, nextAssets, prevAssets) {
    const nextValue = nextAssets === null || nextAssets === void 0 ? void 0 : nextAssets[key];
    const prevValue = prevAssets === null || prevAssets === void 0 ? void 0 : prevAssets[key];
    if (nextValue === prevValue) {
        return;
    }
    el[key] = nextValue === undefined ? null : nextValue;
}
//# sourceMappingURL=renderer.js.map