import { Renderer } from "../render/renderer";

export function nextTick<T>(handler?: () => T | Promise<T>): Promise<T | void> {
    return Promise.resolve().then(async () => {
        Renderer.flush();
        return handler ? await handler() : undefined;
    });
}
