import { NEvent } from "@nodomx/runtime-template";
import { RenderedDom } from "@nodomx/shared";
import type { ModuleLike } from "@nodomx/shared";
/**
 * 事件工厂
 *
 * @remarks
 * 每个模块一个事件工厂，用于管理模块内虚拟dom对应的事件对象
 * 事件配置不支持表达式
 * 代理事件不支持capture和nopopo
 *
 * 当父模块传递事件给子模块时，子模块根节点的参数model为子模块srcDom的model（来源于父模块），根节点自带事件model为子模块model
 * 如果存在传递事件和自带事件，则执行顺序为 1.自带事件 2.传递事件
 */
export declare class EventFactory {
    /**
     * 所属模块
     */
    private module;
    /**
     * 自有事件map
     */
    private eventMap;
    /**
     * 代理事件map
     */
    private delgMap;
    /**
     * 构造器
     * @param module - 模块
     */
    constructor(module: ModuleLike);
    /**
     * 添加事件
     * @param dom - 渲染节点
     * @param event - 事件对象
     */
    addEvent(dom: RenderedDom, event: NEvent): void;
    /**
     * 删除事件
     * @param dom - 渲染节点
     * @param event - 事件对象
     */
    removeEvent(dom: RenderedDom, event?: NEvent): void;
    /**
     * 绑定dom节点所有事件
     * @param dom - 渲染dom
     * @param events - 事件对象数组
     */
    private bind;
    /**
     * 绑定到代理对象
     * @param dom - 代理dom
     * @param dom1 - 被代理dom
     * @param event - 事件对象
     */
    private bindDelg;
    /**
     * 解绑dom节点事件
     * @param key - dom key
     * @param event - 事件对象或事件名
     * @param delg - 是否为代理事件
     */
    private unbind;
    /**
     * 执行代理事件
     * @param dom - 代理节点
     * @param eventName - 事件名
     * @param e - html event对象
     */
    private doDelgEvent;
    /**
     * 调用方法
     * @param event - 事件对象
     * @param dom - 渲染节点
     * @param e - html 事件对象
     */
    private invoke;
    /**
     * 清除所有事件
     */
    clear(): void;
    /**
     * 处理dom event
     * @param dom - 新dom
     * @param oldDom - 旧dom
     */
    handleDomEvent(dom: RenderedDom, oldDom?: RenderedDom): void;
}
