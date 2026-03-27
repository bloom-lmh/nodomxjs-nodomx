# 发布与 CI

这一页专门说明“怎样把 NodomX 做成正规上线项目”。

## 当前仓库已经具备的基础

这轮仓库已经补上：

- GitHub Actions CI
- GitHub Pages 文档部署 workflow
- npm 发布 workflow
- VSCode Marketplace 发布 workflow
- VitePress 文档站
- `vite-plugin-nodomx`

## 还需要你提供什么

要真正上线，还需要这几类外部权限：

### GitHub

- 一个真实的 GitHub 仓库
- 你把当前仓库推到 GitHub
- 开启 GitHub Pages

### npm

- 官方 npm 账号
- `NPM_TOKEN`

### VSCode Marketplace

- 已创建 publisher
- `VSCE_PAT`

## GitHub Actions 工作流

仓库现在包含这几个 workflow：

- `CI`: 每次 push / PR 执行 `npm ci`、`build:all`、`test:all`、`package:extension`
- `Docs`: push 到 `main` 后构建 VitePress 并部署到 GitHub Pages
- `Release`: tag 或手动触发后执行 `release:check`，再按需发布 npm 包和 VSCode 扩展

## GitHub Actions 约定的 secrets

- `NPM_TOKEN`
- `VSCE_PAT`

如果你未来还想把扩展同时发布到 Open VSX，再单独补 `OVSX_TOKEN` 即可。

## 触发方式

### CI

每次 push / pull request 自动执行：

- `npm ci`
- `npm run build:all`
- `npm run test:all`
- `npm run package:extension`

### Docs

推送到 `main` 后自动部署 VitePress 到 GitHub Pages。

### Release

你可以通过 GitHub Actions 的 `workflow_dispatch` 手动触发正式发布，也可以按 tag 触发。

## 推荐发布顺序

1. 把仓库推到 GitHub
2. 在 GitHub 仓库里配置 secrets
3. 先跑一次 CI
4. 再跑 docs deploy
5. 最后发布 npm 包与 VSCode 扩展

## 本地命令

```bash
npm run release:preflight
npm run release:check
npm run package:extension
```

正式发布时：

```bash
npm run release:publish -- --tag latest
npm run publish:extension
```

## 现实边界

我可以把仓库改到“只差凭证就能发”的状态，但我不能替你凭空完成：

- 推送到一个你还没提供地址的 GitHub 仓库
- 登录你的 npm 账号
- 登录你的 VSCode Marketplace publisher

这三步都需要你的账号权限或 token。
