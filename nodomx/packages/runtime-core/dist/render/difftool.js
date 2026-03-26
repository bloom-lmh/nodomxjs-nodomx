export class DiffTool {
    static compare(src, dst) {
        const changeArr = [];
        clearUsed(dst);
        compareNode(src, dst);
        return changeArr;
        function compareNode(nextNode, prevNode) {
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
                    }
                    else if (nextNode.childModuleId !== prevNode.childModuleId) {
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
        function compareChildren(nextNode, prevNode) {
            var _a, _b;
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
                }
                else if ((_a = prevNode.locMap) === null || _a === void 0 ? void 0 : _a.has(child.key)) {
                    const nextLoc = (_b = nextNode.locMap) === null || _b === void 0 ? void 0 : _b.get(child.key);
                    const oldLoc = prevNode.locMap.get(child.key);
                    if (nextLoc !== oldLoc) {
                        addChange(4, child, null, prevNode, nextLoc, oldLoc);
                        oldIndex = oldLoc;
                    }
                    compareNode(child, prevNode.children[oldLoc]);
                }
                else {
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
        function isChanged(nextNode, prevNode) {
            for (const prop of ["props", "assets", "events"]) {
                if ((!nextNode[prop] && prevNode[prop]) || (nextNode[prop] && !prevNode[prop])) {
                    return true;
                }
                if (!nextNode[prop] || !prevNode[prop]) {
                    continue;
                }
                const nextKeys = Object.keys(nextNode[prop]);
                const prevKeys = Object.keys(prevNode[prop]);
                if (nextKeys.length !== prevKeys.length) {
                    return true;
                }
                for (const key of nextKeys) {
                    if (nextNode[prop][key] !== prevNode[prop][key]) {
                        return true;
                    }
                }
            }
            return false;
        }
        function addChange(type, dom, dom1, parent, loc, loc1) {
            const changed = [type, dom, dom1, parent, loc, loc1];
            if (type === 5) {
                delete dom.node;
            }
            changeArr.push(changed);
            return changed;
        }
    }
}
function clearUsed(dom) {
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
//# sourceMappingURL=difftool.js.map