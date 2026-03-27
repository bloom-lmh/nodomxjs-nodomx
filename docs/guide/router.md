# Router 与应用入口

## 创建应用

```ts
import { Nodom } from "nodomx";
import App from "./App.nd";

const app = Nodom.createApp(App, "#app");
app.mount("#app");
```

## 安装路由能力

```ts
import { Nodom, Router } from "nodomx";

Nodom.use(Router);
```

## 注册路由

```ts
import { Nodom, Router } from "nodomx";
import HomePage from "./pages/HomePage.nd";

Nodom.use(Router);

Nodom.createRoute([
  {
    path: "/",
    name: "home",
    module: HomePage
  },
  {
    path: "/report",
    name: "report",
    load: async () => import("./pages/ReportPage.nd"),
    preload: true
  }
]);
```

## 路由配置能力

`RouteCfg` 当前支持：

- `path`
- `name`
- `meta`
- `redirect`
- `beforeEnter`
- `module`
- `component`
- `load` / `loader`
- `preload`
- `children` / `routes`
- `onEnter`
- `onLeave`

## 模板里使用

```html
<template>
  <main>
    <route path="/">Home</route>
    <route path="/report">Report</route>
    <router />
  </main>
</template>
```

## 组合式 API

```ts
import { useRoute, useRouter } from "nodomx";

const router = useRouter();
const route = useRoute();

const warmReport = () => {
  router.preload("/report?id=7");
};

const openReport = () => {
  router.push("/report?id=7");
};
```

## 程序式导航

当前路由实例常用方法包括：

- `push(path)`
- `replace(path)`
- `resolve(path)`
- `preload(path)`
- `go(path)`

## 预加载建议

最常见的预加载时机有两个：

- 鼠标悬停菜单
- 页面首屏渲染后预热下一跳页面
