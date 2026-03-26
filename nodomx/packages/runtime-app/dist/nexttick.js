import { Renderer } from "@nodomx/runtime-view";
export function nextTick(handler) {
    return Promise.resolve().then(async () => {
        Renderer.flush();
        return handler ? await handler() : undefined;
    });
}
//# sourceMappingURL=nexttick.js.map