import { NodomMessage_en } from "./locales/msg_en";
import { NodomMessage_zh } from "./locales/msg_zh";
export const RuntimeConfig = {
    isDebug: false
};
export let NodomMessage = NodomMessage_zh;
export function setRuntimeDebug(debug) {
    RuntimeConfig.isDebug = !!debug;
}
export function setRuntimeLang(lang) {
    NodomMessage = lang === "en" ? NodomMessage_en : NodomMessage_zh;
}
//# sourceMappingURL=runtime.js.map