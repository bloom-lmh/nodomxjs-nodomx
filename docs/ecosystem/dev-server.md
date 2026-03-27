# 开发服务器

`@nodomx/rollup-plugin-dev-server` 是面向 Rollup 的轻量开发服务器。

## 它解决什么问题

- 本地静态文件服务
- 页面自动注入 HMR 客户端
- `.nd` 组件变更后的热更新
- 组件状态恢复

## 典型组合

```bash
npm install nodomx
npm install -D rollup @nodomx/rollup-plugin-nd @nodomx/rollup-plugin-dev-server
```

## 典型配置

```js
import { nodomNd } from "@nodomx/rollup-plugin-nd";
import { nodomDevServer } from "@nodomx/rollup-plugin-dev-server";

export default {
  input: "./src/main.js",
  plugins: [
    nodomNd(),
    nodomDevServer({
      port: 3000,
      open: true
    })
  ]
};
```

## 当前 HMR 特性

- `.nd` 文件变更后尽量局部替换
- 顶层 `setup()` 状态恢复
- 无法安全热替换时回退到根级重挂载

## 边界

这不是 Vite 那种插件容器级别的生态整合。它更适合：

- 纯 Rollup 项目
- 官方脚手架
- 轻量开发环境
