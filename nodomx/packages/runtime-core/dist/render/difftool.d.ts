import { ChangedDom, RenderedDom } from "../types";
export declare class DiffTool {
    static compare(src: RenderedDom, dst: RenderedDom): ChangedDom[];
}
