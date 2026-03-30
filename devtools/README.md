# `@nodomx/devtools`

`@nodomx/devtools` 提供一套 NodomX 运行时调试桥和浏览器内调试面板。

当前版本支持：

- 自动发现已挂载的 NodomX app
- 查看模块树和 `setup/model` 状态快照
- 查看官方 store 当前状态
- 监听 mount / render / unmount 更新
- 浏览器内最小调试面板

## 使用

```bash
npm install -D @nodomx/devtools
```

```js
import { createDevtools } from "@nodomx/devtools";
import { Nodom } from "nodomx";
import App from "./App.nd";

const app = Nodom.createApp(App, "#app");
app.use(createDevtools());
app.mount("#app");
```
