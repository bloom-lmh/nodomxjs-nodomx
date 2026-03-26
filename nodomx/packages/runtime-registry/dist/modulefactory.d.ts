import type { AppContext, ModuleLike, UnknownClass } from "@nodomx/shared";
/**
 * 模块工厂
 * @remarks
 * 用于管理模块类和模块实例
 */
export declare class ModuleFactory {
    private static modules;
    static classes: Map<string, UnknownClass>;
    static aliasMap: Map<string, string>;
    private static mainModule?;
    private static moduleId;
    private static appContext?;
    static add(item: ModuleLike): void;
    static get(name: number | string | UnknownClass): ModuleLike | undefined;
    static hasClass(clazzName: string): boolean;
    static addClass(clazz: unknown, alias?: string): void;
    static getClass(name: string): UnknownClass | undefined;
    static load(modulePath: string): Promise<UnknownClass | undefined>;
    static remove(id: number): void;
    static setMain(m?: ModuleLike): void;
    static getMain(): ModuleLike | undefined;
    static setAppContext(context?: AppContext): void;
    static getAppContext(): AppContext | undefined;
}
