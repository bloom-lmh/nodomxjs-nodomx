# Rollup 插件

`@nodomx/rollup-plugin-nd` 负责让 Rollup 直接识别 `.nd`。

## 安装

```bash
npm install nodomx
npm install -D rollup @nodomx/rollup-plugin-nd
```

## 配置

```js
import { nodomNd } from "@nodomx/rollup-plugin-nd";

export default {
  input: "./src/main.js",
  plugins: [nodomNd()]
};
```

## 然后就可以

```ts
import App from "./App.nd";
```

## 常见组合

如果你要本地开发体验，通常会和官方 dev server 一起用：

```bash
npm install -D @nodomx/rollup-plugin-dev-server
```

## 适用场景

- 你已经有 Rollup 工程
- 你想继续用官方 dev server
- 你不需要 Vite 体系
