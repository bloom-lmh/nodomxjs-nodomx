import { ChangedDom, RenderedDom } from "@nodomx/shared";
export declare class DiffTool {
    static compare(src: RenderedDom, dst: RenderedDom): ChangedDom[];
}
