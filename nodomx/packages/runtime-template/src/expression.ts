import { RuntimeConfig } from "@nodomx/shared";
import { NError } from "@nodomx/shared";
import { Model } from "@nodomx/runtime-module";
import { Module } from "@nodomx/runtime-module";
import { normalizeDependencyPath } from "@nodomx/runtime-optimize";
import { ExpressionMethod } from "@nodomx/shared";
import { Util } from "@nodomx/shared";

export class Expression {
    id: number;
    execFunc: ExpressionMethod;
    exprStr: string;
    depPaths: string[] = [];
    hasUnknownDeps: boolean = false;

    constructor(exprStr: string) {
        this.id = Util.genId();
        if (!exprStr || (exprStr = exprStr.trim()) === "") {
            return;
        }
        if (RuntimeConfig.isDebug) {
            this.exprStr = exprStr;
        }
        if (exprStr.includes("[")) {
            this.hasUnknownDeps = true;
        }
        const funStr = this.compile(exprStr);
        this.execFunc = new Function("$model", "return " + funStr) as ExpressionMethod;
    }

    private compile(exprStr: string) {
        const reg = /('[\s\S]*?')|("[\s\S]*?")|(`[\s\S]*?`)|([a-zA-Z$_][\w$]*\s*?:)|((\.{3}|\.)?[a-zA-Z$_][\w$]*(\.[a-zA-Z$_][\w$]*)*(\s*[\[\(](\s*\))?)?)/g;
        let result: RegExpExecArray;
        let retS = "";
        let index = 0;

        while ((result = reg.exec(exprStr)) !== null) {
            let token = result[0];
            if (index < result.index) {
                retS += exprStr.substring(index, result.index);
            }
            if (token[0] === "'" || token[0] === '"' || token[0] === "`") {
                retS += token;
            } else {
                const lastChar = token[token.length - 1];
                if (lastChar === ":") {
                    retS += token;
                } else if (lastChar === "(" || lastChar === ")") {
                    retS += handleFunc.call(this, token);
                } else if (
                    token.startsWith("this.")
                    || token === "$model"
                    || Util.isKeyWord(token)
                    || (token[0] === "." && token[1] !== ".")
                ) {
                    retS += token;
                } else {
                    let prefix = "";
                    if (token.startsWith("...")) {
                        prefix = "...";
                        token = token.substring(3);
                    }
                    this.addDependency(token);
                    retS += prefix + "$model." + token;
                }
            }
            index = reg.lastIndex;
        }

        if (index < exprStr.length) {
            retS += exprStr.substring(index);
        }
        return retS;
    }

    public val(module: Module, model: Model): unknown {
        if (!this.execFunc) {
            return;
        }
        try {
            return this.execFunc.call(module, model);
        } catch (e) {
            if (RuntimeConfig.isDebug) {
                console.error(new NError("wrongExpression", this.exprStr).message);
                console.error(e);
            }
        }
    }

    public addDependency(path: string): void {
        const normalized = normalizeDependencyPath(path);
        if (!normalized || this.depPaths.includes(normalized)) {
            return;
        }
        this.depPaths.push(normalized);
    }
}

function handleFunc(this: Expression, str: string): string {
    str = str.replace(/\s+/g, "");
    const leftParenIndex = str.lastIndexOf("(");
    const dotIndex = str.indexOf(".");
    const fnName = dotIndex !== -1 ? str.substring(0, dotIndex) : str.substring(0, leftParenIndex);

    if (dotIndex !== -1) {
        this.addDependency(str.substring(0, leftParenIndex));
        return str;
    }

    let result = "this.invokeMethod('" + fnName + "'";
    result += str[str.length - 1] !== ")" ? "," : ")";
    return result;
}


