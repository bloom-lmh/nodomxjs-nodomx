# 介绍

NodomX 是一个面向单页应用的 MVVM 前端框架。它延续了 Nodom 系列“模块 + 模板 + 指令”的核心思路，同时补齐了现代前端开发真正高频的能力：

- 组合式响应式状态
- `.nd` 单文件组件
- `<script setup>` 语法糖
- 应用级插件与 `provide` / `inject`
- 路由懒加载与预加载
- 更细粒度的渲染优化
- Rollup / Vite / VSCode 工具链

## NodomX 不是什么

NodomX 不是 Vue 3 的兼容实现，也不是刻意模仿其 API 的壳。它仍然保留自己的模板语法、指令体系和模块系统。

这意味着：

- 你可以继续写传统 `Module + template() + data()`
- 也可以用 `setup()` 或 `.nd + <script setup>`
- 模板里仍然是 `{{count}}`、`e-click="inc"`、`x-repeat={{list}}`

## 当前官方能力

框架本体已经具备：

- 模块系统
- 模板编译
- 指令与事件
- 响应式系统
- 组合式 API
- 路由系统
- 编译期结构块标记
- 列表 keyed diff
- 静态提升与 block tree 复用

工具链已经具备：

- `@nodomx/nd-compiler`
- `@nodomx/rollup-plugin-nd`
- `@nodomx/rollup-plugin-dev-server`
- `vite-plugin-nodomx`
- `create-nodomx`
- `nodomx-nd-vscode`

## 推荐使用方式

新项目推荐直接这样选型：

1. 组件格式使用 `.nd`
2. 状态写法使用 `<script setup>`
3. 开发工具优先选脚手架、Vite 或官方 Rollup dev server
4. 模板中的列表尽量带稳定 `key`
5. 通过 VSCode 扩展获得 `.nd` 语言服务

## 整体架构

NodomX 当前 monorepo 分成两层：

- 框架本体：`nodomx`、`@nodomx/reactivity`、`@nodomx/runtime-*`
- 工具生态：`.nd` 编译器、Rollup 插件、开发服务器、Vite 插件、脚手架、VSCode 扩展、VitePress 文档站

本体里又按职责拆成多个运行时子包：

- `@nodomx/reactivity`: 组合式响应式系统
- `@nodomx/runtime-template`: 模板编译、表达式、事件与虚拟节点
- `@nodomx/runtime-module`: 模块实例、模型代理、模块状态
- `@nodomx/runtime-view`: 渲染、diff、样式与事件工厂
- `@nodomx/runtime-router`: 路由、路径解析、预加载
- `@nodomx/runtime-app`: 应用、插件、生命周期与 `Nodom`

## 你可以怎么迁移

如果你是旧项目：

- 保留原来的 `template()`、`data()`、`x-*`、`e-*` 语法
- 按模块逐步引入 `setup()`
- 新页面优先改写成 `.nd`

如果你是新项目：

- 用 `npm create nodomx@latest`
- 默认使用 `.nd + <script setup>`
- 构建层优先选 `vite-plugin-nodomx` 或官方 Rollup dev server
