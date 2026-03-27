# `@nodomx/nd-compiler`

`.nd` 编译器是整个单文件组件链路的底层。

## 支持能力

- 解析 `<template>`
- 解析 `<script>`
- 解析 `<script setup>`
- 解析 `<style>`
- 解析 `<style scoped>`
- 目录监听与自动编译

## CLI

```bash
ndc ./src/App.nd --out ./src/App.nd.gen.mjs
ndc ./src --watch
```

常用参数：

- `--out`
- `--watch`
- `--import-source`
- `--suffix`

## API

- `compileFile(file)`
- `compilePath(fileOrDirectory)`
- `collectNdFiles(directory)`
- `watchNd(fileOrDirectory)`

## 作用

上层的 Rollup 插件、Vite 插件和 VSCode 扩展，本质上都复用了这套编译能力。

## 适合什么时候单独用

- 你只想把 `.nd` 编译成模块文件
- 你准备把编译结果交给别的构建链
- 你在编辑器里做保存自动编译
