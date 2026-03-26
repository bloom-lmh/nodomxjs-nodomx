import { ChangedDom, RenderedDom } from "../types";

export class DiffTool {
    public static compare(src: RenderedDom, dst: RenderedDom): ChangedDom[] {
        const changeArr: ChangedDom[] = [];
        clearUsed(dst);
        compareNode(src, dst);
        return changeArr;

        function compareNode(nextNode: RenderedDom, prevNode: RenderedDom): void {
            if (!nextNode || !prevNode) {
                return;
            }
            if (nextNode === prevNode || nextNode.__skipDiff) {
                nextNode.node = prevNode.node;
                prevNode["__used"] = true;
                return;
            }

            nextNode.node = prevNode.node;
            prevNode["__used"] = true;

            if (!nextNode.tagName) {
                if (!prevNode.tagName) {
                    if ((nextNode.staticNum || prevNode.staticNum) && nextNode.textContent !== prevNode.textContent) {
                        addChange(2, nextNode, prevNode, prevNode.parent);
                    } else if (nextNode.childModuleId !== prevNode.childModuleId) {
                        addChange(5, nextNode, prevNode, prevNode.parent);
                    }
                    return;
                }
                addChange(5, nextNode, prevNode, prevNode.parent);
                return;
            }

            if (((nextNode.childModuleId || prevNode.childModuleId) && nextNode.childModuleId !== prevNode.childModuleId)
                || nextNode.tagName !== prevNode.tagName) {
                addChange(5, nextNode, prevNode, prevNode.parent);
                return;
            }

            if ((nextNode.staticNum || prevNode.staticNum || prevNode.key === 1) && isChanged(nextNode, prevNode)) {
                addChange(2, nextNode, prevNode, prevNode.parent);
            }
            compareChildren(nextNode, prevNode);
        }

        function compareChildren(nextNode: RenderedDom, prevNode: RenderedDom): void {
            if (!nextNode.children || nextNode.children.length === 0) {
                if (prevNode.children && prevNode.children.length > 0) {
                    prevNode.children.forEach(item => addChange(3, item, null, prevNode));
                }
                return;
            }

            if (!prevNode.children || prevNode.children.length === 0) {
                nextNode.children.forEach((item, index) => addChange(1, item, null, prevNode, index));
                return;
            }

            let oldIndex = 0;
            for (let i = 0; i < nextNode.children.length; i++) {
                const child = nextNode.children[i];
                if (prevNode.children[oldIndex] && prevNode.children[oldIndex].key === child.key) {
                    if (oldIndex !== i) {
                        addChange(4, child, null, prevNode, i, oldIndex);
                    }
                    compareNode(child, prevNode.children[oldIndex]);
                } else if (prevNode.locMap?.has(child.key)) {
                    const nextLoc = nextNode.locMap?.get(child.key) as number;
                    const oldLoc = prevNode.locMap.get(child.key) as number;
                    if (nextLoc !== oldLoc) {
                        addChange(4, child, null, prevNode, nextLoc, oldLoc);
                        oldIndex = oldLoc;
                    }
                    compareNode(child, prevNode.children[oldLoc]);
                } else {
                    addChange(1, child, null, prevNode, i);
                }
                oldIndex++;
            }

            for (const child of prevNode.children) {
                if (!child["__used"]) {
                    addChange(3, child, null, prevNode);
                }
            }
        }

        function isChanged(nextNode: RenderedDom, prevNode: RenderedDom): boolean {
            for (const prop of ["props", "assets", "events"] as const) {
                if ((!nextNode[prop] && prevNode[prop]) || (nextNode[prop] && !prevNode[prop])) {
                    return true;
                }
                if (!nextNode[prop] || !prevNode[prop]) {
                    continue;
                }
                const nextKeys = Object.keys(nextNode[prop] as object);
                const prevKeys = Object.keys(prevNode[prop] as object);
                if (nextKeys.length !== prevKeys.length) {
                    return true;
                }
                for (const key of nextKeys) {
                    if (nextNode[prop]![key] !== prevNode[prop]![key]) {
                        return true;
                    }
                }
            }
            return false;
        }

        function addChange(
            type: number,
            dom: RenderedDom,
            dom1?: RenderedDom,
            parent?: RenderedDom,
            loc?: number,
            loc1?: number
        ): ChangedDom {
            const changed = [type, dom, dom1, parent, loc, loc1] as ChangedDom;
            if (type === 5) {
                delete dom.node;
            }
            changeArr.push(changed);
            return changed;
        }
    }
}

function clearUsed(dom: RenderedDom | undefined): void {
    if (!dom) {
        return;
    }
    delete dom["__used"];
    if (dom.children) {
        for (const child of dom.children) {
            clearUsed(child);
        }
    }
}
