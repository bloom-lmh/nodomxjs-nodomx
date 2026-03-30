# Vite 插件

`vite-plugin-nodomx` 是当前推荐的应用开发路径。

## 安装

```bash
npm install nodomx
npm install -D vite vite-plugin-nodomx
```

## 基本配置

```ts
import { defineConfig } from "vite";
import { nodomx } from "vite-plugin-nodomx";

export default defineConfig({
  plugins: [nodomx()]
});
```

## 入口示例

```ts
import { Nodom } from "nodomx";
import { bootstrapNodomxViteApp } from "vite-plugin-nodomx/runtime";

await bootstrapNodomxViteApp({
  nodom: Nodom,
  hot: import.meta.hot,
  deps: ["./App.nd"],
  load: () => import("./App.nd"),
  selector: "#app"
});
```

## 当前能力

- `.nd` 直接编译
- `lang="ts"` 支持
- sourcemap
- `.nd` block 级热更新元信息
- overlay 恢复提示
- 编译失败时保留 last-good output
- 模板类型检查与跨组件 contract 检查

## 什么时候优先选 Vite

- 你要最快的本地启动体验
- 你要更自然的现代前端工程接入
- 你希望 starter、TS、SSR、契约检查都先走官方主线
