# 模块系统

模块是 NodomX 的一等公民。无论你写 `.nd` 还是手写类，最终都会落到模块实例上。

## 经典模块定义

```ts
import { Module } from "nodomx";

export class UserCard extends Module {
  template() {
    return `
      <section class="user-card">
        <h3>{{name}}</h3>
      </section>
    `;
  }

  data() {
    return {
      name: "NodomX"
    };
  }
}
```

## `setup()` 与经典模块共存

模块除了 `data()` 之外，还可以提供 `setup()`：

```ts
import { Module, useComputed, useState } from "nodomx";

export class CounterPanel extends Module {
  template() {
    return `
      <section>
        <p>{{count}}</p>
        <p>{{doubleCount}}</p>
      </section>
    `;
  }

  setup() {
    const count = useState(1);
    const doubleCount = useComputed(() => count.value * 2);
    return { count, doubleCount };
  }
}
```

## 子模块声明

如果模板中要直接使用子模块标签，可以在模块上声明 `modules`：

```ts
import { Module } from "nodomx";
import { UserCard } from "./UserCard";

export class Dashboard extends Module {
  modules = [UserCard];

  template() {
    return `
      <div>
        <user-card />
      </div>
    `;
  }
}
```

## 模块生命周期

模块支持一组事件型生命周期钩子：

- `onInit`
- `onCompile`
- `onBeforeFirstRender`
- `onBeforeRender`
- `onRender`
- `onFirstRender`
- `onBeforeMount`
- `onMount`
- `onBeforeUpdate`
- `onUpdate`
- `onBeforeUnMount`
- `onUnMount`

组合式 API 也提供对应钩子：

- `onInit`
- `onBeforeRender`
- `onRender`
- `onBeforeMount`
- `onMounted`
- `onBeforeUpdate`
- `onUpdated`
- `onBeforeUnmount`
- `onUnmounted`

## 常用实例能力

模块实例常用方法包括：

- `active()`
- `watch()`
- `set()`
- `get()`
- `getModule()`
- `getModules()`
- `getRenderedDom()`
- `getNode()`

这些方法适合：

- 在模块内部主动驱动更新
- 调试渲染节点
- 访问子模块
- 与旧风格模块代码兼容

## 模块与 `.nd`

`.nd` 文件最终会被编译为一个继承 `Module` 的类，所以：

- `.nd` 不是另一套运行时
- `.nd` 和手写模块可以混用
- HMR、路由、插槽、本体优化都共享同一条运行时链路
