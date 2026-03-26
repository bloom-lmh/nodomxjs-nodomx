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
export class EventFactory{
    /**
     * 所属模块
     */
    private module:ModuleLike;
    
    /**
     * 自有事件map
     */
    private eventMap:Map<string|number,{eventName:string,controller:AbortController}[]> = new Map(); 

    /**
     * 代理事件map
     */
    private delgMap:Map<string|number,Map<string,{controller:AbortController,events:{event:NEvent,dom:RenderedDom}[]}>> = new Map();
    
    /**
     * 构造器
     * @param module - 模块
     */
    constructor(module:ModuleLike){
        this.module = module;
    }

    /**
     * 添加事件
     * @param dom - 渲染节点
     * @param event - 事件对象
     */
    public addEvent(dom:RenderedDom,event:NEvent){
        dom.events.push(event);
        if(dom.node){
            this.bind(dom,[event]);
        }
    }

    /**
     * 删除事件
     * @param dom - 渲染节点
     * @param event - 事件对象
     */
    public removeEvent(dom:RenderedDom,event?: NEvent) {
        const events = (event?[event]:dom.events) as NEvent[] | undefined;
        if(!events || !Array.isArray(events)){
            return;
        }
        for(const ev of events){
            if(ev.delg){
                const parent = dom.key === 1?this.module.srcDom?.parent:dom.parent;
                const pkey = dom.key === 1?this.module.srcDom?.parent?.key+"s":dom.parent?.key;
                if(!parent || !this.delgMap.has(pkey)){
                    return;
                }
                const cfgKey = parent.moduleId !== dom.moduleId ? pkey : parent.key;
                const cfg = this.delgMap.get(cfgKey);
                if(!cfg || !cfg.has(ev.name)){
                    return;
                }
                const obj = cfg.get(ev.name);
                const index = obj.events.findIndex(item=>item.event===ev);
                if(index !== -1){
                    obj.events.splice(index,1);
                }
                if(obj.events.length === 0){
                    this.unbind(cfgKey,ev,true);
                }
            }else{
                this.unbind(dom.key,ev);
            }
        }
    }

    /**
     * 绑定dom节点所有事件
     * @param dom - 渲染dom
     * @param events - 事件对象数组
     */
    private bind(dom:RenderedDom,events:NEvent[]){
        const el = <HTMLElement>dom.node;
        for(const ev of events){
            if(ev.delg){
                const parent = dom.key === 1?this.module.srcDom.parent:dom.parent;
                if(parent){
                    this.bindDelg(parent,dom,ev);
                }
            }else{
                const controller = new AbortController();
                el.addEventListener(ev.name,(e)=>{
                    if(ev.nopopo){
                        e.stopPropagation();
                    }
                    this.invoke(ev,dom,e);
                },{
                    capture:ev.capture,
                    once:ev.once,
                    signal:controller.signal
                });
                if(!ev.once){
                    const o = {eventName:ev.name,controller:controller};
                    if(!this.eventMap.has(dom.key)){
                        this.eventMap.set(dom.key,[o]);
                    }else{
                        this.eventMap.get(dom.key).push(o);
                    }
                }
            }
        }
    }

    /**
     * 绑定到代理对象
     * @param dom - 代理dom
     * @param dom1 - 被代理dom
     * @param event - 事件对象
     */
    private bindDelg(dom:RenderedDom,dom1:RenderedDom,event:NEvent){
        let map;
        const pkey = dom.moduleId !== dom1.moduleId?dom.key+"s":dom.key;
        if(!this.delgMap.has(pkey)){
            map = new Map();
            this.delgMap.set(pkey,map);
        }else{
            map = this.delgMap.get(pkey);
        }
        let cfg;
        if(map.has(event.name)){
            cfg = map.get(event.name);
            cfg.events.push({event:event,dom:dom1});
        }else{
            cfg = {controller:new AbortController,events:[{event:event,dom:dom1}]};
            map.set(event.name,cfg);
            dom.node.addEventListener(event.name,(e)=>{
                this.doDelgEvent(dom,event.name,e);
            },{
                signal:cfg.controller.signal
            });
        }
    }

    /**
     * 解绑dom节点事件
     * @param key - dom key
     * @param event - 事件对象或事件名
     * @param delg - 是否为代理事件
     */
    private unbind(key:number|string,event?:NEvent|string,delg?:boolean){
        if(event && event instanceof NEvent){
            delg ||= event.delg;
        }
        if(delg){
            if(!this.delgMap.has(key)){
                return;
            }
            const obj = this.delgMap.get(key);
            if(event){
                const eventName = event instanceof NEvent?event.name:event;
                if(obj.has(eventName)){
                    obj.get(eventName)?.controller?.abort();
                }
            }else{
                for(const k of obj.keys()){
                    obj.get(k).controller?.abort();
                }
            }
        }else {
            if(!this.eventMap.has(key)){
                return;
            }
            const arr = this.eventMap.get(key);
            if(event){
                const o = arr.find(item=>item.eventName === event);
                if(o){
                    o.controller.abort();
                }
            }else{
                for(const o of arr){
                    o.controller.abort();
                }
            }
            if(arr.length === 0){
                this.eventMap.delete(key);
            }
        }
    }

    /**
     * 执行代理事件
     * @param dom - 代理节点
     * @param eventName - 事件名
     * @param e - html event对象
     */
    private doDelgEvent(dom:RenderedDom,eventName:string,e){
        const key = dom.moduleId !== this.module.id?dom.key+"s":dom.key;
        
        if(!this.delgMap.has(key)){
            return;
        }
        const map = this.delgMap.get(key);
        if(!map.has(eventName)){
            return;
        }
        const cfg = map.get(eventName);
        const elArr = e.path || (e.composedPath?e.composedPath():undefined);
        if(!elArr){
            return;
        }
        for(let ii=0;ii<cfg.events.length;ii++){
            const obj = cfg.events[ii];
            const ev = obj.event;
            const dom1 = obj.dom;
            const el = dom1.node;
            for(let i=0;i<elArr.length && elArr[i]!==dom.node;i++){
                if(elArr[i] === el){
                    this.invoke(ev,dom1,e);
                    if(ev.once){
                        cfg.events.splice(ii--,1);
                        if(cfg.events.length === 0){
                            this.unbind(key,eventName,true);
                        }
                    }
                    break;
                }
            }
        }
    }
    
    /**
     * 调用方法
     * @param event - 事件对象
     * @param dom - 渲染节点
     * @param e - html 事件对象
     */
    private invoke(event:NEvent,dom:RenderedDom,e){
        let model;
        if(event.module && event.module.id !== this.module.id){
            model = this.module.srcDom.model;
            dom = this.module.srcDom;
        }else{
            dom = event.module.getRenderedDom(dom.key);
            model = dom.model;
        }
        if(typeof event.handler === "string"){
            event.module.invokeMethod(event.handler,model,dom,event, e);
        }else if(typeof event.handler === "function"){
            event.handler.apply(event.module||this.module,[model,dom,event,e]);
        }
    }

    /**
     * 清除所有事件
     */
    public clear(){
        for(const key of this.eventMap.keys()){
            this.unbind(key);
        }
        this.eventMap.clear();
        for(const key of this.delgMap.keys()){
            this.unbind(key,null,true);
        }
        this.delgMap.clear();
    }

    /**
     * 处理dom event
     * @param dom - 新dom
     * @param oldDom - 旧dom
     */
    public handleDomEvent(dom:RenderedDom,oldDom?:RenderedDom){
        const events = dom.events as NEvent[] | undefined;
        let arr: NEvent[] = [];
        if(oldDom && Array.isArray(oldDom.events)){
            const oldEvents = oldDom.events as NEvent[];
            if(Array.isArray(events)){
                events.forEach((ev)=>{
                    let index;
                    if((index=oldEvents.indexOf(ev)) !== -1){
                        oldEvents.splice(index,1);
                    }else{
                        arr.push(ev);
                    }
                });
            }
            if(oldEvents.length > 0){
                for(const ev of oldEvents){
                    this.removeEvent(oldDom,ev);
                }
            }
        }else{
            arr = events || [];
        }
        if(arr?.length>0){
            this.bind(dom,arr);
        }
    }
}
