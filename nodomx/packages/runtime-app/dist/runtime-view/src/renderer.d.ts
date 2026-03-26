import { VirtualDom } from "@nodomx/runtime-template";
import { Model } from "@nodomx/runtime-module";
import { Module } from "@nodomx/runtime-module";
import { ChangedDom, RenderedDom } from "@nodomx/shared";
export declare class Renderer {
    private static rootEl;
    private static waitList;
    private static waitSet;
    static setRootEl(rootEl: HTMLElement): void;
    static getRootEl(): HTMLElement;
    static add(module: Module): void;
    static remove(module: Module): void;
    static render(): void;
    static flush(maxRounds?: number): void;
    static renderDom(module: Module, src: VirtualDom, model: Model, parent?: RenderedDom, key?: number | string, notRenderChild?: boolean, previousDom?: RenderedDom, dirtyPaths?: string[]): RenderedDom;
    private static handleDirectives;
    private static handleProps;
    static updateToHtml(module: Module, dom: RenderedDom, oldDom: RenderedDom): Node;
    static renderToHtml(module: Module, src: RenderedDom, parentEl: Node | null): Node;
    static handleChangedDoms(module: Module, changeDoms: ChangedDom[]): void;
    private static replace;
}
