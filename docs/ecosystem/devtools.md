# `@nodomx/devtools`

`@nodomx/devtools` 是 NodomX 的第一版调试桥与浏览器内调试面板。

## 当前能力

- 自动发现已挂载 app
- 查看模块树快照
- 查看 `setup / model / props / route` 快照
- 查看官方 store 当前状态
- 跟随 mount / render / unmount 更新
- 浏览器内最小调试面板

## 安装

```bash
npm install -D @nodomx/devtools
```

## 使用

```js
import { createDevtools } from "@nodomx/devtools";
import { Nodom } from "nodomx";
import App from "./App.nd";

const app = Nodom.createApp(App, "#app");
app.use(createDevtools());
app.mount("#app");
```

## 说明

这还是第一版，不是完整浏览器扩展级 DevTools，但已经能作为运行时调试入口，后续可以继续演进成更完整的检查器。
