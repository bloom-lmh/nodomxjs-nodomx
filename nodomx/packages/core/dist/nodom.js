var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DirectiveManager } from "./directivemanager";
import { NError } from "./error";
import { NodomMessage_en } from "./locales/msg_en";
import { NodomMessage_zh } from "./locales/msg_zh";
import { ModuleFactory } from "./modulefactory";
import { Renderer } from "./renderer";
import { RequestManager } from "./requestmanager";
import { Route } from "./route";
import { Scheduler } from "./scheduler";
import { Util } from "./util";
/**
 * nodom提示消息
 */
export let NodomMessage = NodomMessage_zh;
/**
 * Nodom接口暴露类
 */
export class Nodom {
    /**
     * 应用初始化
     * @param clazz -     模块类
     * @param selector -  根模块容器选择器，默认使用document.body
     */
    static app(clazz, selector) {
        this.mountApp(clazz, selector, false);
    }
    /**
     * 重新挂载应用(用于开发时热更新)
     * @param clazz -     模块类
     * @param selector -  根模块容器选择器
     */
    static remount(clazz, selector) {
        this.mountApp(clazz, selector, true);
    }
    /**
     * 重新挂载应用并恢复热更新状态
     * @param clazz -       模块类
     * @param selector -    根模块容器选择器
     * @param hotState -    热更新状态快照
     * @param changedFiles - 触发热更新的文件列表
     */
    static hotReload(clazz, selector, hotState, changedFiles) {
        if (this.reloadChangedModules(this.normalizeChangedFiles(changedFiles))) {
            return;
        }
        const hotSnapshot = isModuleHotSnapshot(hotState) ? hotState : undefined;
        if (!hotSnapshot && hotState && clazz && typeof clazz === 'function') {
            clazz['__nodomHotState'] = hotState;
        }
        const module = this.mountApp(clazz, selector, true);
        Renderer.flush();
        if (hotSnapshot && module && typeof module.applyHotSnapshot === 'function') {
            module.applyHotSnapshot(hotSnapshot);
            Renderer.flush();
        }
    }
    /**
     * 捕获主模块热更新状态
     * @returns 热更新状态
     */
    static captureHotState() {
        const main = ModuleFactory.getMain();
        if (!main || typeof main.captureHotSnapshot !== 'function') {
            return {};
        }
        return main.captureHotSnapshot();
    }
    /**
     * 启用debug模式
     */
    static debug() {
        this.isDebug = true;
    }
    /**
     * 设置语言
     * @param lang -  语言（zh,en），默认zh
     */
    static setLang(lang) {
        //设置nodom语言
        switch (lang || 'zh') {
            case 'zh':
                NodomMessage = NodomMessage_zh;
                break;
            case 'en':
                NodomMessage = NodomMessage_en;
        }
    }
    /**
     * use插件（实例化）
     * @remarks
     * 插件实例化后以单例方式存在，第二次use同一个插件，将不进行任何操作，实例化后可通过Nodom['$类名']方式获取
     * @param clazz -   插件类
     * @param params -  参数
     * @returns         实例化后的插件对象
     */
    static use(clazz, params) {
        if (!clazz['name']) {
            new NError('notexist', NodomMessage.TipWords.plugin);
        }
        if (!this['$' + clazz['name']]) {
            this['$' + clazz['name']] = Reflect.construct(clazz, params || []);
        }
        return this['$' + clazz['name']];
    }
    /**
     * 创建路由
     * @remarks
     * 配置项可以用嵌套方式
     * @example
     * ```js
     * Nodom.createRoute([{
     *   path: '/router',
     *   //直接用模块类，需import
     *   module: MdlRouteDir,
     *   routes: [
     *       {
     *           path: '/route1',
     *           module: MdlPMod1,
     *           routes: [{
     *               path: '/home',
     *               //直接用路径，实现懒加载
     *               module:'/examples/modules/route/mdlmod1.js'
     *           }, ...]
     *       }, {
     *           path: '/route2',
     *           module: MdlPMod2,
     *           //设置进入事件
     *           onEnter: function (module,path) {},
     *           //设置离开事件
     *           onLeave: function (module,path) {},
     *           ...
     *       }
     *   ]
     * }])
     * ```
     * @param config -  路由配置
     * @param parent -  父路由
     */
    static createRoute(config, parent) {
        if (!Nodom['$Router']) {
            throw new NError('uninit', NodomMessage.TipWords.route);
        }
        let route;
        parent = parent || Nodom['$Router'].getRoot();
        if (Util.isArray(config)) {
            for (const item of config) {
                route = new Route(item, parent);
            }
        }
        else {
            route = new Route(config, parent);
        }
        return route;
    }
    /**
     * 创建指令
     * @param name -      指令名
     * @param priority -  优先级（1最小，1-10为框架保留优先级）
     * @param handler -   渲染时方法
     */
    static createDirective(name, handler, priority) {
        return DirectiveManager.addType(name, handler, priority);
    }
    /**
     * 注册模块
     * @param clazz -   模块类
     * @param name -    注册名，如果没有，则为类名
     */
    static registModule(clazz, name) {
        ModuleFactory.addClass(clazz, name);
    }
    /**
     * ajax 请求，如果需要用第三方ajax插件替代，重载该方法
     * @param config -  object 或 string，如果为string，则表示url，直接以get方式获取资源，如果为 object，配置项如下:
     * ```
     *  参数名|类型|默认值|必填|可选值|描述
     *  -|-|-|-|-|-
     *  url|string|无|是|无|请求url
     *	method|string|GET|否|GET,POST,HEAD|请求类型
     *	params|object/FormData|空object|否|无|参数，json格式
     *	async|bool|true|否|true,false|是否异步
     *  timeout|number|0|否|无|请求超时时间
     *  type|string|text|否|json,text|
     *	withCredentials|bool|false|否|true,false|同源策略，跨域时cookie保存
     *  header|Object|无|否|无|request header 对象
     *  user|string|无|否|无|需要认证的请求对应的用户名
     *  pwd|string|无|否|无|需要认证的请求对应的密码
     *  rand|bool|无|否|无|请求随机数，设置则浏览器缓存失效
     * ```
     */
    static request(config) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RequestManager.request(config);
        });
    }
    /**
     * 重复请求拒绝时间间隔
     * @remarks
     * 如果设置此项，当url一致时且间隔时间小于time，则拒绝请求
     * @param time -  时间间隔（ms）
     */
    static setRejectTime(time) {
        RequestManager.setRejectTime(time);
    }
    /**
     * mount or remount app
     * @param clazz -         模块类
     * @param selector -      根模块容器选择器
     * @param replaceExisting - 是否替换已有主模块
     */
    static mountApp(clazz, selector, replaceExisting) {
        const rootEl = document.querySelector(selector) || Renderer.getRootEl() || document.body;
        const main = ModuleFactory.getMain();
        if (replaceExisting && main) {
            main.destroy();
            if (rootEl) {
                rootEl.innerHTML = '';
            }
        }
        //设置渲染器的根 element
        Renderer.setRootEl(rootEl);
        //渲染器启动渲染任务
        Scheduler.addTask(Renderer.render, Renderer);
        //添加请求清理任务
        Scheduler.addTask(RequestManager.clearCache);
        //启动调度器
        Scheduler.start();
        const module = ModuleFactory.get(clazz);
        if (module) {
            ModuleFactory.setMain(module);
            module.active();
        }
        return module;
    }
    /**
     * try to refresh only changed nd component subtrees
     * @param changedFiles - changed nd files
     * @returns true if handled by subtree hot swap
     */
    static reloadChangedModules(changedFiles) {
        if (changedFiles.length === 0) {
            return false;
        }
        const main = ModuleFactory.getMain();
        if (!main || typeof main.getHotId !== 'function') {
            return false;
        }
        const hotIds = new Set(changedFiles);
        const mainHotId = normalizeHotId(main.getHotId());
        if (mainHotId && hotIds.has(mainHotId)) {
            return false;
        }
        const targets = this.collectHotReloadTargets(main, hotIds);
        if (targets.length === 0) {
            return false;
        }
        const parents = new Set();
        for (const target of targets) {
            target.parent.children = target.parent.children.filter((child) => child !== target.module);
            target.parent.objectManager.removeDomParam(target.srcDomKey, '$savedModule');
            parents.add(target.parent);
        }
        for (const parent of parents) {
            Renderer.add(parent);
        }
        Renderer.flush();
        let restored = false;
        for (const target of targets) {
            const nextModule = target.parent.children.find((child) => {
                var _a;
                return ((_a = child === null || child === void 0 ? void 0 : child.srcDom) === null || _a === void 0 ? void 0 : _a.key) === target.srcDomKey
                    && typeof child.getHotId === 'function'
                    && normalizeHotId(child.getHotId()) === target.hotId;
            });
            if (nextModule && typeof nextModule.applyHotSnapshot === 'function') {
                nextModule.applyHotSnapshot(target.snapshot);
                restored = true;
            }
        }
        if (restored) {
            Renderer.flush();
        }
        return true;
    }
    /**
     * collect highest matched component targets for subtree hot replacement
     * @param module - current module
     * @param hotIds - changed hot ids
     * @returns reload targets
     */
    static collectHotReloadTargets(module, hotIds) {
        var _a, _b;
        const hotId = normalizeHotId((_a = module.getHotId) === null || _a === void 0 ? void 0 : _a.call(module));
        if (hotId && hotIds.has(hotId)) {
            const parent = (_b = module.getParent) === null || _b === void 0 ? void 0 : _b.call(module);
            if (parent && module.srcDom && typeof module.captureHotSnapshot === 'function') {
                return [{
                        hotId,
                        module,
                        parent,
                        snapshot: module.captureHotSnapshot(),
                        srcDomKey: module.srcDom.key
                    }];
            }
            return [];
        }
        const targets = [];
        for (const child of module.children || []) {
            targets.push(...this.collectHotReloadTargets(child, hotIds));
        }
        return targets;
    }
    /**
     * normalize changed files from the dev server payload
     * only pure .nd updates can use subtree hmr safely
     * @param changedFiles - raw changed files
     * @returns normalized nd file ids
     */
    static normalizeChangedFiles(changedFiles) {
        if (!Array.isArray(changedFiles) || changedFiles.length === 0) {
            return [];
        }
        const normalized = [];
        for (const file of changedFiles) {
            const hotId = normalizeHotId(file);
            if (!hotId) {
                continue;
            }
            if (!/\.nd($|\?)/i.test(hotId)) {
                return [];
            }
            normalized.push(hotId.replace(/\?.*$/, ''));
        }
        return normalized;
    }
}
function normalizeHotId(hotId) {
    return typeof hotId === 'string' ? hotId.replace(/\\/g, '/') : '';
}
function isModuleHotSnapshot(value) {
    return !!value
        && typeof value === 'object'
        && typeof value.hotId === 'string'
        && Array.isArray(value.children)
        && typeof value.state === 'object';
}
//# sourceMappingURL=nodom.js.map