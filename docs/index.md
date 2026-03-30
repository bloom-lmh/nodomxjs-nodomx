---
layout: home

hero:
  name: NodomX
  text: 用 .nd 写组件，用 script setup 写状态
  tagline: 保留 Nodom 风格模板与模块系统，同时补齐组合式 API、编译优化、语言服务、SSR/SSG 与完整工具链。
  image:
    src: /logo.svg
    alt: NodomX
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 工具与部署
      link: /guide/tooling-deploy

features:
  - title: 保留原有模板语法
    details: 继续使用 `{{expr}}`、`e-click`、`x-repeat`、`<route />` 这一套 Nodom 风格，不需要为了组合式 API 重写模板。
  - title: .nd 单文件组件
    details: 支持 `<template>`、`<script>`、`<script setup>`、`<style scoped>`，并接入 Rollup、Vite、VSCode。
  - title: 组合式 API 与运行时能力
    details: 提供组合式状态、异步组件、KeepAlive、Teleport、Transition、TransitionGroup、Suspense、Router、Store。
  - title: TypeScript 与模板检查
    details: 支持 `.nd` 的 `lang="ts"`、类型面生成、模板绑定检查、跨组件 props/emits/slots 契约检查。
  - title: 完整工具链
    details: 官方提供脚手架、编译器、Rollup 插件、开发服务器、Vite 插件、VSCode 插件、test-utils、SSR、devtools。
  - title: 可发布生态
    details: npm 包、GitHub Actions、Vercel / GitHub Pages / 国内静态部署与 VSCode 插件市场链路都已接通。
---

## 为什么是 NodomX

NodomX 的目标不是照搬 Vue 3，而是在保留模块化与模板指令风格的前提下，把现代前端最常用的能力补齐：

- 组合式状态
- `.nd` 单文件组件
- `<script setup>`
- 应用级插件与依赖注入
- Router / Store / SSR / SSG
- Rollup / Vite / VSCode 全链路支持

## 当前生态

- `nodomx`
- `@nodomx/store`
- `@nodomx/test-utils`
- `@nodomx/ssr`
- `@nodomx/devtools`
- `@nodomx/nd-compiler`
- `@nodomx/rollup-plugin-nd`
- `@nodomx/rollup-plugin-dev-server`
- `vite-plugin-nodomx`
- `create-nodomx`
- `nodomx-nd-vscode`

## 官方站点

- 国际站：[https://nodomx-docs.vercel.app/](https://nodomx-docs.vercel.app/)
- 中文站：[https://nodomx-e83lc0sk.maozi.io/](https://nodomx-e83lc0sk.maozi.io/)
