import { NodomMessage } from "@nodomx/shared";
import { NError } from "@nodomx/shared";
import { Util } from "@nodomx/shared";

export class RequestManager {
    public static rejectReqTick: number = 0;
    private static requestMap: Map<string, { params: unknown; time: number }> = new Map();

    public static setRejectTime(time: number): void {
        this.rejectReqTick = time;
    }

    public static async request(config): Promise<unknown> {
        if (typeof config === "string") {
            config = { url: config };
        }
        config = config || {};
        config.params = config.params || {};
        this.clearCache();

        const time = Date.now();
        if (this.rejectReqTick > 0) {
            const cached = this.requestMap.get(config.url);
            if (cached && time - cached.time < this.rejectReqTick && Util.compare(cached.params as object, config.params)) {
                return null;
            }
            this.requestMap.set(config.url, {
                time,
                params: config.params
            });
        }

        return new Promise((resolve, reject) => {
            if (config.rand) {
                config.params.$rand = Math.random();
            }

            let url: string = config.url;
            const async: boolean = config.async === false ? false : true;
            const req: XMLHttpRequest = new XMLHttpRequest();
            req.withCredentials = config.withCredentials;

            const method: string = (config.method || "GET").toUpperCase();
            req.timeout = async ? config.timeout : 0;

            req.onload = () => {
                if (req.status === 200) {
                    let response: unknown = req.responseText;
                    if (config.type === "json") {
                        try {
                            response = JSON.parse(req.responseText);
                        } catch {
                            reject({ type: "jsonparse" });
                            return;
                        }
                    }
                    resolve(response);
                    return;
                }
                reject({ type: "error", url });
            };

            req.ontimeout = () => reject({ type: "timeout" });
            req.onerror = () => reject({ type: "error", url });

            let data: FormData | null = null;
            if (method === "GET") {
                const query = this.buildQuery(config.params);
                if (query) {
                    url += url.includes("?") ? `&${query}` : `?${query}`;
                }
            } else if (method === "POST") {
                data = config.params instanceof FormData ? config.params : this.buildFormData(config.params);
            }

            req.open(method, url, async, config.user, config.pwd);
            if (config.header) {
                Util.getOwnProps(config.header).forEach((item) => {
                    req.setRequestHeader(item, config.header[item]);
                });
            }
            req.send(data);
        }).catch((error) => {
            switch (error.type) {
                case "error":
                    throw new NError("notexist1", NodomMessage.TipWords["resource"], error.url);
                case "timeout":
                    throw new NError("timeout");
                case "jsonparse":
                    throw new NError("jsonparse");
            }
        });
    }

    public static clearCache(): void {
        const time = Date.now();
        if (this.rejectReqTick <= 0) {
            return;
        }
        for (const [key, value] of this.requestMap) {
            if (time - value.time > this.rejectReqTick) {
                this.requestMap.delete(key);
            }
        }
    }

    private static buildQuery(params: Record<string, unknown>): string {
        if (!Util.isObject(params)) {
            return "";
        }
        const parts: string[] = [];
        for (const key of Object.keys(params)) {
            let value = params[key];
            if (value === undefined || value === null) {
                continue;
            }
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            parts.push(`${key}=${value}`);
        }
        return parts.join("&");
    }

    private static buildFormData(params: Record<string, unknown>): FormData {
        const fd = new FormData();
        for (const key of Object.keys(params || {})) {
            let value = params[key];
            if (value === undefined || value === null) {
                continue;
            }
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            fd.append(key, value as string);
        }
        return fd;
    }
}

