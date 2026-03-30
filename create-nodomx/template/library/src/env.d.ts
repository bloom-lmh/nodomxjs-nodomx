declare module "nodomx" {
  export type UnknownClass = new (...args: any[]) => any;
  export class Router {}
  export class Nodom {
    static app(clazz: unknown, selector?: string): unknown;
    static createApp(clazz: unknown, selector?: string): unknown;
    static createRoute(routes: unknown[]): unknown;
    static use(plugin: unknown, ...params: unknown[]): unknown;
  }
}

declare module "*.nd" {
  import type { UnknownClass } from "nodomx";
  const component: UnknownClass;
  export default component;
}

declare module "vite-plugin-nodomx" {
  import type { Plugin } from "vite";
  export function nodomx(options?: Record<string, unknown>): Plugin;
}

declare module "vite-plugin-nodomx/runtime" {
  export function bootstrapNodomxViteApp(options: {
    nodom: unknown;
    hot?: unknown;
    deps?: string[];
    load: () => Promise<unknown>;
    selector?: string;
  }): Promise<unknown>;
}
