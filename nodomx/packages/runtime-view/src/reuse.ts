import { VirtualDom } from "@nodomx/runtime-template";
import { hasDependencyMatch } from "@nodomx/runtime-optimize";
import { RenderedDom } from "@nodomx/shared";

export function resolveRenderedKey(src: VirtualDom, key?: number | string): number | string {
    return key === undefined || key === null ? src.key : `${src.key}_${key}`;
}

export function appendRenderedChild(parent: RenderedDom | undefined, child: RenderedDom): void {
    if (!parent) {
        return;
    }
    parent.children ||= [];
    parent.locMap ||= new Map();
    child.parent = parent;
    parent.locMap.set(child.key, parent.children.length);
    parent.children.push(child);
}

export function findPreviousChild(
    previousDom: RenderedDom | undefined,
    src: VirtualDom,
    key?: number | string
): RenderedDom | undefined {
    if (!previousDom?.children || previousDom.children.length === 0) {
        return;
    }
    const renderedKey = resolveRenderedKey(src, key);
    const index = previousDom.locMap?.get(renderedKey);
    if (index !== undefined) {
        return previousDom.children[index];
    }
    return previousDom.children.find(item => item?.key === renderedKey);
}

export function canReuseRenderedSubtree(
    src: VirtualDom,
    previousDom: RenderedDom | undefined,
    dirtyPaths?: string[]
): boolean {
    if (!previousDom) {
        return false;
    }
    if (previousDom.vdom && previousDom.vdom !== src) {
        return false;
    }
    if (src.tagName !== previousDom.tagName) {
        return false;
    }
    if (src.key === 1) {
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

export function reuseRenderedDom(
    previousDom: RenderedDom,
    src: VirtualDom,
    model: RenderedDom["model"],
    parent?: RenderedDom
): RenderedDom {
    previousDom.__skipDiff = true;
    previousDom.parent = parent;
    previousDom.vdom = src;
    previousDom.model = model;
    return previousDom;
}

