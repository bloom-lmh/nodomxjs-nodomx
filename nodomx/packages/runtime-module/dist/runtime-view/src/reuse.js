import { hasDependencyMatch } from "@nodomx/runtime-optimize";
export function resolveRenderedKey(src, key) {
    return key === undefined || key === null ? src.key : `${src.key}_${key}`;
}
export function appendRenderedChild(parent, child) {
    if (!parent) {
        return;
    }
    parent.children || (parent.children = []);
    parent.locMap || (parent.locMap = new Map());
    child.parent = parent;
    parent.locMap.set(child.key, parent.children.length);
    parent.children.push(child);
}
export function findPreviousChild(previousDom, src, key) {
    var _a;
    if (!(previousDom === null || previousDom === void 0 ? void 0 : previousDom.children) || previousDom.children.length === 0) {
        return;
    }
    const renderedKey = resolveRenderedKey(src, key);
    const index = (_a = previousDom.locMap) === null || _a === void 0 ? void 0 : _a.get(renderedKey);
    if (index !== undefined) {
        return previousDom.children[index];
    }
    return previousDom.children.find(item => (item === null || item === void 0 ? void 0 : item.key) === renderedKey);
}
export function canReuseRenderedSubtree(src, previousDom, dirtyPaths) {
    if (!previousDom) {
        return false;
    }
    if (src.tagName !== previousDom.tagName) {
        return false;
    }
    if (src.hoisted) {
        return true;
    }
    if (src.subtreeForceFullRender) {
        return false;
    }
    if (!dirtyPaths || dirtyPaths.length === 0 || dirtyPaths.includes("*")) {
        return src.subtreeDepPaths.length === 0;
    }
    if (src.subtreeDepPaths.length === 0) {
        return true;
    }
    return !hasDependencyMatch(src.subtreeDepPaths, dirtyPaths);
}
export function reuseRenderedDom(previousDom, src, model, parent) {
    previousDom.__skipDiff = true;
    previousDom.parent = parent;
    previousDom.vdom = src;
    previousDom.model = model;
    return previousDom;
}
//# sourceMappingURL=reuse.js.map