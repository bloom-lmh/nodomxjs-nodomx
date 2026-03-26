import { NodomMessage } from "../app/nodom";
import { NError } from "../error";
import { Util } from "../util";
export class RequestManager {
    static setRejectTime(time) {
        this.rejectReqTick = time;
    }
    static async request(config) {
        if (typeof config === "string") {
            config = { url: config };
        }
        config = config || {};
        config.params = config.params || {};
        this.clearCache();
        const time = Date.now();
        if (this.rejectReqTick > 0) {
            const cached = this.requestMap.get(config.url);
            if (cached && time - cached.time < this.rejectReqTick && Util.compare(cached.params, config.params)) {
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
            let url = config.url;
            const async = config.async === false ? false : true;
            const req = new XMLHttpRequest();
            req.withCredentials = config.withCredentials;
            const method = (config.method || "GET").toUpperCase();
            req.timeout = async ? config.timeout : 0;
            req.onload = () => {
                if (req.status === 200) {
                    let response = req.responseText;
                    if (config.type === "json") {
                        try {
                            response = JSON.parse(req.responseText);
                        }
                        catch {
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
            let data = null;
            if (method === "GET") {
                const query = this.buildQuery(config.params);
                if (query) {
                    url += url.includes("?") ? `&${query}` : `?${query}`;
                }
            }
            else if (method === "POST") {
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
    static clearCache() {
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
    static buildQuery(params) {
        if (!Util.isObject(params)) {
            return "";
        }
        const parts = [];
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
    static buildFormData(params) {
        const fd = new FormData();
        for (const key of Object.keys(params || {})) {
            let value = params[key];
            if (value === undefined || value === null) {
                continue;
            }
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }
            fd.append(key, value);
        }
        return fd;
    }
}
RequestManager.rejectReqTick = 0;
RequestManager.requestMap = new Map();
//# sourceMappingURL=requestmanager.js.map