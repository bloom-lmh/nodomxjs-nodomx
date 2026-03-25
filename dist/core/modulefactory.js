var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 模块工厂
 * @remarks
 * 管理所有模块类、模块实例
 */
export class ModuleFactory {
    /**
     * 添加模块实例到工厂
     * @param item -  模块对象
     */
    static add(item) {
        // 第一个为主模块
        if (this.modules.size === 0) {
            this.mainModule = item;
        }
        this.modules.set(item.id, item);
        //添加模块类
        this.addClass(item.constructor);
    }
    /**
     * 获得模块
     * @remarks
     * 当name为id时，则获取对应id的模块
     *
     * 当name为字符串时，表示模块类名
     *
     * 当name为class时，表示模块类
     *
     * @param name -  类或实例id
     */
    static get(name) {
        const tp = typeof name;
        let mdl;
        if (tp === 'number') { //数字，模块id
            return this.modules.get(name);
        }
        else {
            if (tp === 'string') { //字符串，模块类名
                name = name.toLowerCase();
                if (!this.classes.has(name)) { //为别名
                    name = this.aliasMap.get(name);
                }
                if (this.classes.has(name)) {
                    mdl = Reflect.construct(this.classes.get(name), [++this.moduleId]);
                }
            }
            else { //模块类
                mdl = Reflect.construct(name, [++this.moduleId]);
            }
            if (mdl) {
                mdl.init();
                return mdl;
            }
        }
    }
    /**
     * 是否存在模块类
     * @param clazzName -   模块类名
     * @returns     true/false
     */
    static hasClass(clazzName) {
        const name = clazzName.toLowerCase();
        return this.classes.has(name) || this.aliasMap.has(name);
    }
    /**
     * 添加模块类
     * @param clazz -   模块类
     * @param alias -   别名
     */
    static addClass(clazz, alias) {
        //转换成小写
        const name = clazz.name.toLowerCase();
        if (this.classes.has(name)) {
            return;
        }
        this.classes.set(name, clazz);
        //添加别名
        if (alias) {
            this.aliasMap.set(alias.toLowerCase(), name);
        }
    }
    /**
     * 获取模块类
     * @param name -    类名或别名
     * @returns         模块类
     */
    static getClass(name) {
        name = name.toLowerCase();
        return this.classes.has(name) ? this.classes.get(name) : this.classes.get(this.aliasMap.get(name));
    }
    /**
     * 加载模块
     * @remarks
     * 用于实现模块懒加载
     * @param modulePath -   模块类路径
     * @returns              模块类
     */
    static load(modulePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const m = yield import(modulePath);
            if (m) {
                //通过import的模块，查找模块类
                for (const k of Object.keys(m)) {
                    if (m[k].name) {
                        this.addClass(m[k]);
                        return m[k];
                    }
                }
            }
        });
    }
    /**
     * 从工厂移除模块
     * @param id -    模块id
     */
    static remove(id) {
        this.modules.delete(id);
    }
    /**
     * 设置应用主模块
     * @param m - 	模块
     */
    static setMain(m) {
        this.mainModule = m;
    }
    /**
     * 获取应用主模块
     * @returns 	应用的主模块
     */
    static getMain() {
        return this.mainModule;
    }
}
/**
 * 模块对象集合
 * @remarks
 * 格式为map，其中：
 *
 * key: 模块id
 *
 * value: 模块对象
 */
ModuleFactory.modules = new Map();
/**
 * 模块类集合
 * @remarks
 * 格式为map，其中：
 *
 *  key:    模块类名或别名
 *
 *  value:  模块类
 */
ModuleFactory.classes = new Map();
/**
 * 别名map
 * @remarks
 * 格式为map，其中：
 *
 * key:     别名
 *
 * value:   类名
 */
ModuleFactory.aliasMap = new Map();
/**
 * 模块id自增量
 */
ModuleFactory.moduleId = 0;
//# sourceMappingURL=modulefactory.js.map