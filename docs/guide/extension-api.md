# 扩展能力

NodomX 允许你扩展指令、组件和模板元素，而不是把能力完全锁死在框架内部。

## 自定义指令

```ts
import { Nodom } from "nodomx";

Nodom.directive("focus", function (module, dom) {
  dom.props ||= {};
  dom.props.autofocus = true;
  return true;
}, 10);
```

## 自定义元素

你可以通过 `DefineElementManager` 把一个新标签映射成编译期行为：

```ts
import { DefineElement, DefineElementManager, Directive } from "nodomx";

class PANEL extends DefineElement {
  constructor(node, module) {
    super(node, module);
    node.addDirective(new Directive("show", node.getProp("when")));
    node.delProp("when");
  }
}

DefineElementManager.add(PANEL);
```

## 模块注册

```ts
import { Nodom } from "nodomx";
import { UserCard } from "./UserCard";

Nodom.registModule(UserCard, "user-card");
```

## 全局组件与全局属性

```ts
app.component("user-card", UserCard);
Nodom.setGlobal("$env", "production");
```

## 什么时候写扩展

- 业务内部复用模板片段，优先写子模块
- 需要统一一类模板语法，考虑自定义结构元素
- 需要复用一类运行时行为，考虑插件
- 需要在模板层引入新规则，考虑自定义指令
