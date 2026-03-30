# 开发服务器

`@nodomx/rollup-plugin-dev-server` 是官方 Rollup 开发服务器。

## 提供什么

- 本地静态资源服务
- 自动注入 HMR 客户端
- `.nd` 组件热更新
- 尽量保留 `setup()` / reactive 状态
- 端口冲突时自动顺延
- 控制台输出 `Local / Public / Dist`

## 安装

```bash
npm install nodomx
npm install -D rollup @nodomx/rollup-plugin-nd @nodomx/rollup-plugin-dev-server
```

## 配置示例

```js
import { nodomNd } from "@nodomx/rollup-plugin-nd";
import { nodomDevServer } from "@nodomx/rollup-plugin-dev-server";

export default {
  input: "./src/main.js",
  plugins: [
    nodomNd(),
    nodomDevServer({
      host: "127.0.0.1",
      open: true,
      port: 3000
    })
  ]
};
```

## 当前 HMR 特性

- `.nd` 结构改动优先走 block 级恢复
- style-only 改动尽量不触发整页刷新
- 恢复失败时保留上一次可用输出
- 控制台与运行时都能看到当前恢复策略

## 适用场景

- 官方 Rollup starter
- 轻量本地开发环境
- 不需要 Vite 全生态时
