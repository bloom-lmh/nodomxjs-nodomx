# `@nodomx/nd-compiler`

`.nd` 编译器是整个单文件组件链路的底层能力。Rollup、Vite、VSCode 插件、本地 CLI 与 SSR 模板，最终都复用这套编译结果。

## 支持能力

- 解析 `<template>`
- 解析 `<script>`
- 解析 `<script setup>`
- 支持 `<script lang="ts">`
- 支持 `<script setup lang="ts">`
- 解析 `<style>` / `<style scoped>`
- 生成 `.nd.gen.mjs`
- 生成 `.d.nd.ts`
- 模板绑定检查
- 跨组件 `props / emits / slots` 契约检查
- watch 模式与目录批量编译

## CLI

```bash
npx ndc ./src/App.nd --out ./src/App.nd.gen.mjs
npx ndc ./src --watch
npx ndc ./src/App.nd --declaration
npx ndc ./src --types-only
```

## 常用参数

- `--out`：指定输出文件
- `--watch`：监听目录或文件并自动重编译
- `--suffix`：指定生成文件后缀
- `--import-source`：覆盖导入源
- `--declaration`：生成 `.d.nd.ts`
- `--types-only`：仅生成类型面
- `--no-check-types`：跳过模板/契约检查

## API

- `compileFile(file, options)`
- `compilePath(fileOrDirectory, options)`
- `compileNdWithMap(source, options)`
- `collectNdFiles(directory)`
- `watchNd(fileOrDirectory, options)`

## 适用场景

- 你只想把 `.nd` 编译成模块文件
- 你要自己接入别的构建系统
- 你想做保存自动编译
- 你想在 CI 里单独做 `.nd` 类型检查
