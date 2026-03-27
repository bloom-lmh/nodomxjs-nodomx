---
layout: home

hero:
  name: NodomX
  text: 用 .nd 写组件，用 script setup 写状态
  tagline: 保留 Nodom 风格模板与模块系统，同时补齐组合式 API、路由、编译优化、语言服务和完整工具链。
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
  - title: 保留模板语法
    details: 继续使用 `{{expr}}`、`e-click`、`x-repeat`、`<route />` 这套 Nodom 风格，不需要为了组合式 API 重写语法。
  - title: .nd 单文件组件
    details: 支持 `<template>`、`<script>`、`<script setup>`、`<style scoped>`，并能接入 Rollup、Vite 和 VSCode。
  - title: 组合式与插件
    details: 提供 `useState`、`useReactive`、`useComputed`、`useWatch`、`provide/inject`、`createApp` 和应用级插件机制。
  - title: 编译与运行时优化
    details: 已接入 block tree、静态提升、patch flag、结构块分层、keyed diff 和路由预加载。
  - title: 全链路工具
    details: 提供脚手架、`.nd` 编译器、Rollup 插件、开发服务器、Vite 插件和 VSCode 语言服务器。
  - title: 发布自动化
    details: 仓库已具备 GitHub Actions、npm 发布流程、GitHub Pages 文档部署和 VSCode Marketplace 发布脚本。
---

## 为什么是 NodomX

NodomX 的目标不是照搬 Vue 3，而是在保留自身模块化和模板指令风格的前提下，把现代前端开发里最常用、最需要工程化支持的能力补齐：

- 组合式状态
- `<script setup>` 与 `.nd`
- `.nd` 单文件组件
- 插件与依赖注入
- 路由懒加载与预加载
- 构建工具、语言服务与发布流程

如果你已经有旧模块代码，可以继续写 `template() + data()`；如果你想直接进入新的开发体验，也可以从 `.nd + <script setup>` 开始。

## 文档地图

- 从 [快速开始](/guide/getting-started) 进入，先跑通一个页面。
- 从 [模块系统](/guide/module-system)、[模板语法](/guide/template-syntax) 理解本体能力。
- 从 [组合式 API](/guide/composition-api)、[.nd](/guide/nd-sfc)、[Router](/guide/router) 进入新写法。
- 从 [工具与部署](/guide/tooling-deploy) 和 [发布与 CI](/guide/release-ci) 接入工程化。

## 当前生态

当前 monorepo 已经包含这些官方包：

- `nodomx`
- `@nodomx/reactivity`
- `@nodomx/nd-compiler`
- `@nodomx/rollup-plugin-nd`
- `@nodomx/rollup-plugin-dev-server`
- `vite-plugin-nodomx`
- `create-nodomx`
- `nodomx-nd-vscode`

围绕这些包，已经能覆盖：

- 通过 npm 安装框架与工具
- 通过 `.nd` 写组件
- 通过 Rollup 或 Vite 开发
- 通过 VSCode 获得语言服务
- 通过 GitHub Actions 做 CI、文档部署和发布自动化
