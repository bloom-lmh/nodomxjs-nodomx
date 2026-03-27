# 应用与插件

NodomX 提供两层入口：

- 静态入口 `Nodom.app()`
- 显式应用实例 `Nodom.createApp()`

## 快速挂载

```ts
import { Nodom } from "nodomx";
import App from "./App.nd";

Nodom.app(App, "#app");
```

## 使用 `createApp`

当你需要显式安装插件、全局组件、全局指令或全局注入时，更推荐用 `createApp()`。

```ts
import { Nodom } from "nodomx";
import App from "./App.nd";

const app = Nodom.createApp(App, "#app");

app.mount("#app");
```

`app.mount()` 会把根模块挂载到目标容器；`app.unmount()` 可以卸载当前应用实例。

## 插件

插件支持两种形态：

- 函数插件
- 带 `install(app)` 的对象插件

```ts
import { Nodom } from "nodomx";

const plugin = {
  install(app) {
    app.config.globalProperties.$env = "production";
    app.provide("env", "production");
  }
};

Nodom.use(plugin);
```

## 应用级能力

`App` 实例当前支持：

- `app.use(plugin, ...options)`
- `app.component(name, clazz)`
- `app.directive(name, handler, priority?)`
- `app.provide(key, value)`
- `app.mount(selector?)`
- `app.unmount()`

## 全局能力

应用实例支持：

- `app.use(plugin)`
- `app.component(name, clazz)`
- `app.directive(name, handler, priority)`
- `app.provide(key, value)`

静态入口 `Nodom` 也支持预注册：

- `Nodom.use(plugin)`
- `Nodom.component(name, clazz)`
- `Nodom.directive(name, handler, priority)`
- `Nodom.provide(key, value)`
- `Nodom.setGlobal(name, value)`

## 全局属性

插件里可以通过 `app.config.globalProperties` 暴露全局对象：

```ts
app.config.globalProperties.$env = "production";
```

## 依赖注入

在模块或 `<script setup>` 中：

```ts
import { inject, provide } from "nodomx";

provide("theme", "light");

const theme = inject("theme", "dark");
```

你也可以在根入口统一提供：

```ts
Nodom.provide("theme", "light");
```

## 路由插件

路由不是额外独立安装包的体验，而是内置运行时能力，通过：

```ts
import { Nodom, Router } from "nodomx";

Nodom.use(Router);
```

启用后再注册路由。

## 什么时候用 `Nodom.*`，什么时候用 `app.*`

- 需要整个运行时共享的默认能力，用 `Nodom.use()`、`Nodom.component()`、`Nodom.directive()`、`Nodom.provide()`
- 需要某个应用实例局部生效的能力，用 `app.use()`、`app.component()`、`app.directive()`、`app.provide()`
