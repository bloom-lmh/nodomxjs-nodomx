# `create-nodomx`

官方脚手架包名：`create-nodomx`

## 使用

```bash
npm create nodomx@latest my-app
```

## 默认模板

当前默认是 `vite` 模板，而不是旧的 Rollup 模板。

## 常用组合

```bash
npm create nodomx@latest my-app -- --router --store
npm create nodomx@latest my-app -- --router --store --typescript
npm create nodomx@latest my-lib -- --template library
npm create nodomx@latest my-docs -- --template docs
npm create nodomx@latest my-ssr-app -- --template ssr
```

## 支持的模板

- `vite`
- `basic`：旧 Rollup starter
- `library`
- `docs`
- `ssr`

## 常用参数

- `--router`
- `--store`
- `--typescript`
- `--template <name>`
- `--install`
- `--package-mode registry`
- `--package-mode local`
- `--force`

## 模板能力

- Vite starter：`.nd`、router、store、TypeScript
- library starter：组件库开发与本地演示
- docs starter：VitePress 文档站
- ssr starter：`@nodomx/ssr`、静态生成、payload 恢复
