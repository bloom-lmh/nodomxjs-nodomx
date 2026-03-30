# Rollup 插件

`@nodomx/rollup-plugin-nd` 负责让 Rollup 原生识别 `.nd`。

## 安装

```bash
npm install nodomx
npm install -D rollup @nodomx/rollup-plugin-nd
```

## 基本配置

```js
import { nodomNd } from "@nodomx/rollup-plugin-nd";

export default {
  input: "./src/main.js",
  plugins: [
    nodomNd({
      importSource: "nodomx"
    })
  ]
};
```

## 使用

```js
import App from "./App.nd";
```

## 什么时候用它

- 你已经有 Rollup 工程
- 你想继续用官方 dev server
- 你不打算切到 Vite

如果你要完整本地开发体验，通常会配合 [开发服务器](/ecosystem/dev-server) 一起使用。
