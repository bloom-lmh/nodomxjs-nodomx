# 工具与部署

这套仓库现在已经有一整条可用工具链：

- `nodomx`：框架本体
- `@nodomx/nd-compiler`：`.nd` 编译器
- `@nodomx/rollup-plugin-nd`：Rollup 接入
- `@nodomx/rollup-plugin-dev-server`：官方 Rollup 开发服务器
- `vite-plugin-nodomx`：推荐的应用开发路径
- `create-nodomx`：脚手架
- `nodomx-nd-vscode`：VSCode 插件
- `@nodomx/store`：官方 store
- `@nodomx/test-utils`：官方组件测试工具
- `@nodomx/ssr`：SSR / SSG 能力
- `@nodomx/devtools`：浏览器调试桥与最小面板

## 已上线官网

- 国际站：[https://nodomx-docs.vercel.app/](https://nodomx-docs.vercel.app/)
- 中文站：[https://nodomx-e83lc0sk.maozi.io/](https://nodomx-e83lc0sk.maozi.io/)

## 官方包安装

```bash
npm install nodomx
npm install -D vite-plugin-nodomx
```

常见组合：

```bash
npm install -D @nodomx/nd-compiler
npm install -D @nodomx/rollup-plugin-nd @nodomx/rollup-plugin-dev-server
npm install -D @nodomx/test-utils
npm install @nodomx/store
npm install @nodomx/ssr
npm install -D @nodomx/devtools
```

## 脚手架

```bash
npm create nodomx@latest my-app
npm create nodomx@latest my-app -- --router --store --typescript
npm create nodomx@latest my-ssr-app -- --template ssr
```

## VSCode 插件

Marketplace：
[SWUST-WEBLAB-LMH.nodomx-nd-vscode](https://marketplace.visualstudio.com/items?itemName=SWUST-WEBLAB-LMH.nodomx-nd-vscode)

安装后，VSCode 会识别 `.nd` 并启用语言服务。

## 文档站本地开发

仓库根目录：

```bash
npm run docs:dev
```

或者在 `docs` 目录：

```bash
cd docs
npm install
npm run dev
```

## 文档站构建

```bash
npm run build:docs
```

## Vercel / 帽子云部署

推荐把 `docs` 作为项目根目录：

- Root Directory：`docs`
- Install Command：`npm install`
- Build Command：`npm run build`
- Output Directory：`.vitepress/dist`

仓库里已经提供了 `docs/vercel.json`。

## GitHub Pages 部署

仓库已提供 `.github/workflows/docs.yml`。只需要：

1. GitHub Pages 的 Source 选 `GitHub Actions`
2. 推送 `main` 后等待 `Docs` workflow 成功
