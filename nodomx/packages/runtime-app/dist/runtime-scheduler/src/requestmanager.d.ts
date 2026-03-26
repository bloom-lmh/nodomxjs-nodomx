export declare class RequestManager {
    static rejectReqTick: number;
    private static requestMap;
    static setRejectTime(time: number): void;
    static request(config: any): Promise<unknown>;
    static clearCache(): void;
    private static buildQuery;
    private static buildFormData;
}
