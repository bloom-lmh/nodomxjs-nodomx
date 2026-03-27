# 组合式 API

NodomX 的组合式 API 借鉴了现代前端的状态组织方式，但保留了自己的模板和模块体系。

## 在类模块里使用 `setup()`

```ts
import {
  Module,
  useComputed,
  useReactive,
  useState,
  useWatchEffect
} from "nodomx";

class CounterModule extends Module {
  template() {
    return `
      <div>
        <p>{{count}}</p>
        <p>{{doubleCount}}</p>
        <p>{{profile.name}}</p>
        <button e-click="inc">+1</button>
      </div>
    `;
  }

  setup() {
    const count = useState(1);
    const profile = useReactive({ name: "nodomx" });
    const doubleCount = useComputed(() => count.value * 2);

    const inc = () => {
      count.value++;
    };

    useWatchEffect(() => {
      console.log(doubleCount.value, profile.name);
    });

    return {
      count,
      profile,
      doubleCount,
      inc
    };
  }
}
```

## 常用 API

- `useState`
- `useReactive`
- `useComputed`
- `useWatch`
- `useWatchEffect`
- `useModule`
- `useModel`
- `useApp`
- `useAttrs`
- `useProps`
- `useSlots`
- `provide`
- `inject`
- `useRouter`
- `useRoute`
- `nextTick`

## 生命周期钩子

当前已经提供：

- `onInit`
- `onBeforeRender`
- `onRender`
- `onBeforeMount`
- `onMounted`
- `onBeforeUpdate`
- `onUpdated`
- `onBeforeUnmount`
- `onUnmounted`

## 什么时候用 `.nd + <script setup>`

如果你不再依赖类语法，推荐直接上 `.nd + <script setup>`，因为：

- 少一层返回对象样板
- 模板暴露更自然
- 更适合单文件组织
