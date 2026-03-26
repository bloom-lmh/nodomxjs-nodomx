import { VirtualDom } from "@nodomx/runtime-template";
import { RenderedDom } from "@nodomx/shared";
export declare function resolveRenderedKey(src: VirtualDom, key?: number | string): number | string;
export declare function appendRenderedChild(parent: RenderedDom | undefined, child: RenderedDom): void;
export declare function findPreviousChild(previousDom: RenderedDom | undefined, src: VirtualDom, key?: number | string): RenderedDom | undefined;
export declare function canReuseRenderedSubtree(src: VirtualDom, previousDom: RenderedDom | undefined, dirtyPaths?: string[]): boolean;
export declare function reuseRenderedDom(previousDom: RenderedDom, src: VirtualDom, model: RenderedDom["model"], parent?: RenderedDom): RenderedDom;
