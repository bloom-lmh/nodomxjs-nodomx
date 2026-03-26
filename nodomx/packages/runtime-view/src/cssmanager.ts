import { RenderedDom } from "@nodomx/shared";
import type { ModuleLike } from "@nodomx/shared";
/**
 * css 管理器
 * @privateRemarks
 * 针对不同的rule，处理方式不同
 * 
 * CssStyleRule 进行保存和替换，同时模块作用域scope有效
 * 
 * CssImportRule 路径不重复添加，因为必须加在stylerule前面，所以需要记录最后的import索引号
 */
export class CssManager{

    /**
     * style sheet
     */
    private static sheet:CSSStyleSheet;

    /**
     * import url map，用于存储import的url路径
     */
    private static importMap = new Map();

    /**
     * importrule 位置
     */
    private static importIndex = 0;

    /**
     * css class 前置名
     */
    private static cssPreName = "___nodom_module_css_";
    
    /**
     * 处理style 元素
     * @param module - 模块
     * @param dom - 虚拟dom
     * @returns 如果是styledom，则返回true，否则返回false
     */
    public static handleStyleDom(module:ModuleLike,dom:RenderedDom):void{
        if(dom.props["scope"] === "this"){
            let root;
            for(root=dom.parent;root?.parent;root=root.parent);
            const cls = this.cssPreName + module.id;
            if(root.props["class"]){
                root.props["class"] = root.props["class"] + " " + cls;
            }else{
                root.props["class"] = cls;
            }
        }
    }

    /**
     * 处理 style 下的文本元素
     * @param module - 模块
     * @param dom - style text element
     * @returns 如果是styleTextdom返回true，否则返回false
     */
    public static handleStyleTextDom(module:ModuleLike,dom:RenderedDom):boolean{
        if(!dom.parent || dom.parent.tagName !== "style"){
            return false;
        }
        CssManager.addRules(module,dom.textContent,dom.parent&&dom.parent.props["scope"] === "this"?"." + this.cssPreName + module.id:undefined);
        return true;
    }

    /**
     * 添加多个css rule
     * @param cssText - rule集合
     * @param module - 模块
     * @param scopeName - 作用域名(前置选择器)
     */
    private static addRules(module:ModuleLike,cssText:string,scopeName?:string){
        if(!this.sheet){
            const sheet = document.createElement("style");
            document.head.appendChild(sheet);
            this.sheet = document.styleSheets[0];
        }
        if(scopeName){
            this.clearModuleRules(module);
        }
        const reg = /(@[a-zA-Z]+\s+url\(.+?\))|([.#@a-zA-Z]\S*(\s*\S*\s*?)?{)|\}/g;
        const regImp = /@[a-zA-Z]+\s+url/;
        let startIndex:number=-1;
        let beginNum:number = 0;
        let re;
        while((re=reg.exec(cssText)) !== null){
            if(regImp.test(re[0])){
                handleImport(re[0]);
            }else if(re[0] === "}"){
                if(startIndex>=0 && --beginNum <= 0){
                    const txt = cssText.substring(startIndex,re.index+1);
                    if(txt[0] === "@"){
                        this.sheet.insertRule(txt,CssManager.sheet.cssRules?CssManager.sheet.cssRules.length:0);
                    }else{
                        handleStyle(module,txt,scopeName);
                    }
                    startIndex = -1;
                    beginNum = 0;
                }
            }else{
                if(startIndex === -1){
                    startIndex = re.index;
                }
                beginNum++;
            }
        }
        
        function handleStyle(module:ModuleLike,cssText:string,scopeName?:string){
            const reg = /.+(?=\{)/;
            const r = reg.exec(cssText);
            if(!r){
                return;
            }
            if(scopeName){
                let arr = module.cssRules;
                if(!arr){
                    arr = [];
                    module.cssRules = arr;
                }
                arr.push((scopeName + " " + r[0]));
                cssText = scopeName + " " + cssText;
            }
            CssManager.sheet.insertRule(cssText,CssManager.sheet.cssRules?CssManager.sheet.cssRules.length:0);
        }

        function handleImport(cssText:string){
            const ind = cssText.indexOf("(");
            const ind1 = cssText.lastIndexOf(")");
            if(ind === -1 || ind1 === -1 || ind>=ind1){
                return;
            }
            
            const css = cssText.substring(ind+1,ind1);
            if(CssManager.importMap.has(css)){
                return;
            }
            CssManager.sheet.insertRule(cssText,CssManager.importIndex++);
            CssManager.importMap.set(css,true);
        }
    }

    /**
     * 清除模块css rules
     * @param module - 模块
     */
    public static clearModuleRules(module:ModuleLike){
        const rules = module.cssRules;
        if(!rules || rules.length === 0){
            return;
        }
        for(let i=0;i<this.sheet.cssRules.length;i++){
            const r = <CSSStyleRule>this.sheet.cssRules[i];
            if(r.selectorText && rules.indexOf(r.selectorText) !== -1){
                this.sheet.deleteRule(i--);
            }
        }
        module.cssRules = [];
    }
}
