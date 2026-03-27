# 工具链与部署

这一页讲的是“如何真正把 NodomX 用起来”，包括 `.nd`、语言服务器、脚手架、开发服务器、Vite、Rollup 和发布准备。

## 安装框架

```bash
npm install nodomx
```

## `.nd` 单文件组件

如果你只想手工编译 `.nd`：

```bash
npm install -D @nodomx/nd-compiler
```

```bash
ndc ./src/App.nd --out ./src/App.nd.gen.mjs
```

## Rollup 工程

```bash
npm install nodomx
npm install -D @nodomx/rollup-plugin-nd @nodomx/rollup-plugin-dev-server
```

适合：

- 直接使用官方脚手架模板
- 想走更轻的官方开发体验
- 想用官方 dev server 和 HMR

## Vite 工程

```bash
npm install nodomx
npm install -D vite vite-plugin-nodomx
```

## 脚手架

```bash
npm create nodomx@latest my-app
cd my-app
npm run dev
```

## VSCode 语言服务器

当前扩展包名是 `nodomx-nd-vscode`。

本地打包：

```bash
npm run package:extension
```

输出文件：

```text
vscode-extension/nodomx-nd-vscode-<version>.vsix
```

然后在 VSCode 中执行 `Extensions: Install from VSIX...` 安装。

如果已经发布到 Marketplace，用户可以直接在扩展市场搜索 `NodomX ND`。

## 文档站

本仓库 docs 已切到 VitePress：

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## 发布前校验

```bash
npm run release:check
```

这个命令会覆盖：

- monorepo build
- monorepo test
- npm pack 检查
- docs 构建
- Vite 插件
- VSCode 扩展测试
- VSCode 扩展打包
