import { ModelManager } from "./modelmanager";
import { Util } from "./util";
/**
 * 模型类
 *
 * @remarks
 * 模型就是对数据做代理
 *
 * 注意：数据对象中，以下5个属性名（保留字）不能用，可以通过如：`model.__module`的方式获取保留属性
 *
 *      __key:模型的key
 *
 *      __module:所属模块
 *
 *      __parent:父模型
 *
 */
export class Model {
    /**
     * @param data -    数据
     * @param module - 	模块对象
     * @param parent -  父模型
     * @param name -    模型在父对象中的prop name
     * @returns         模型
     */
    constructor(data, module, parent, name) {
        //数据不存在或已经代理，无需再创建
        if (!data || typeof data !== 'object' || data['__module']) {
            return data;
        }
        //设置key
        data['__key'] = Util.genId();
        // 创建模型
        const proxy = new Proxy(data, {
            set(src, key, value, receiver) {
                //值未变,proxy 不处理
                if (src[key] === value) {
                    return true;
                }
                //已是model且src module和value module不一致，表示被多个module共享，通常在传值过程中
                //加入共享model管理
                if (value && value['__module'] && src['__module'] !== value['__module']) {
                    ModelManager.addShareModel(value, src['__module'] || module);
                }
                const ov = receiver[key];
                src[key] = value;
                //model更新
                ModelManager.update(receiver, key, ov, value);
                return true;
            },
            get(src, key, receiver) {
                //如果为代理，则返回module
                if (key === '__module') {
                    return receiver ? module : undefined;
                }
                //父模型
                if (key === '__parent') {
                    return parent;
                }
                let m = src[key];
                //对象尚未初始化为model
                if (m && typeof m === 'object' && !m['__module']) {
                    m = new Model(m, module, receiver, key);
                    src[key] = m;
                }
                return m;
            },
            deleteProperty(src, key) {
                const oldValue = src[key];
                delete src[key];
                ModelManager.update(proxy, key, oldValue, undefined);
                return true;
            }
        });
        return proxy;
    }
}
//# sourceMappingURL=model.js.map