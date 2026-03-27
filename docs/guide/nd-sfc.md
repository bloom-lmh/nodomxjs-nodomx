# `.nd` 与 `<script setup>`

`.nd` 是 NodomX 的单文件组件格式，适合把模板、逻辑和样式放在一个文件里。

## 支持的区块

- `<template>`
- `<script>`
- `<script setup>`
- `<style>`
- `<style scoped>`

## 示例

```html
<template>
  <section class="counter">
    <p>{{count}}</p>
    <p>{{doubleCount}}</p>
    <button e-click="inc">+1</button>
  </section>
</template>

<script setup>
import { useComputed, useState } from "nodomx";

const count = useState(1);
const doubleCount = useComputed(() => count.value * 2);

const inc = () => {
  count.value++;
};
</script>

<style scoped>
.counter {
  padding: 16px;
}
</style>
```

## `<script setup>` 语法糖

`<script setup>` 下的顶层绑定会自动暴露给模板，不需要再手写 `setup()` 返回对象。

常用 API：

- `useState`
- `useReactive`
- `useComputed`
- `useWatch`
- `useWatchEffect`
- `defineProps`
- `withDefaults`
- `defineOptions`
- `provide`
- `inject`
- `useRoute`
- `useRouter`

当前编译期宏以 `defineOptions()` 为主，适合声明：

- `modules`
- 其他模块级选项

例如：

```html
<script setup>
import ChildPanel from "./ChildPanel.nd";
import { defineOptions, useState } from "nodomx";

defineOptions({
  modules: [ChildPanel]
});

const title = useState("Dashboard");
</script>
```

## 结构型节点与性能建议

推荐给列表写稳定 `key`：

```html
<li x-repeat={{todos}} key={{id}}>
  {{title}}
</li>
```

条件、插槽、模块、路由视图这些结构型节点现在也会形成稳定 block 边界，能减少无关子树的重复 diff。

## 编译产物是什么

`.nd` 最终会被编译成一个继承 `Module` 的类。这意味着：

- `.nd` 和手写模块共享同一套运行时
- `.nd` 可以和经典模块混用
- HMR、路由、slot、模块注册走同一条链路
