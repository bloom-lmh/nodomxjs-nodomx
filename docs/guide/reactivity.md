# 响应式系统

NodomX 现在把响应式能力拆成独立包 `@nodomx/reactivity`，但对用户来说通常直接从 `nodomx` 导入即可。

## 基本状态

```ts
import { useState } from "nodomx";

const count = useState(1);
```

## 对象状态

```ts
import { useReactive } from "nodomx";

const profile = useReactive({
  name: "nodomx",
  stats: {
    visits: 1
  }
});
```

## 计算属性

```ts
import { useComputed, useState } from "nodomx";

const count = useState(1);
const doubleCount = useComputed(() => count.value * 2);
```

## 监听

```ts
import { useWatch, useWatchEffect } from "nodomx";

useWatch(count, (value) => {
  console.log(value);
});

useWatchEffect(() => {
  console.log(doubleCount.value);
});
```

## 模板中的自动展开

虽然 `useState()` 在逻辑里是 `ref` 风格，但模板里仍然直接用：

```html
<p>{{count}}</p>
```

而不是：

```html
<p>{{count.value}}</p>
```

## 模块数据与组合式状态

经典 `data()` 和组合式状态可以共存，但建议新代码优先统一一种写法，避免认知负担。

## API 总览

当前响应式层常用 API 包括：

- `useState`
- `useRef`
- `useReactive`
- `useComputed`
- `useWatch`
- `useWatchEffect`
- `ref`
- `computed`
- `watch`
- `watchEffect`
- `unref`
- `toRaw`
- `isRef`
- `isReactive`

## 推荐习惯

- 基本类型用 `useState`
- 对象和数组用 `useReactive`
- 派生值统一放在 `useComputed`
- 副作用统一放在 `useWatchEffect`
- 精准监听用 `useWatch`

## 与渲染优化的关系

NodomX 会在模板编译和表达式求值阶段记录依赖路径，再和运行时的脏路径一起参与定向更新。所以：

- 状态尽量结构化
- 列表项尽量带稳定 `key`
- 静态壳与动态区尽量分离
