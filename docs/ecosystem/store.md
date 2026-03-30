# `@nodomx/store`

`@nodomx/store` 是官方状态管理方案。

## 安装

```bash
npm install @nodomx/store
```

## 基本用法

```js
import { createStore, defineStore } from "@nodomx/store";
import { Nodom } from "nodomx";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 1
  }),
  actions: {
    inc() {
      this.count += 1;
    }
  }
});

const store = createStore();
const app = Nodom.createApp(App, "#app");
app.use(store);
app.mount("#app");
```

## 支持能力

- `createStore()`
- `defineStore()`
- `storeToRefs()`
- `$patch()`
- `$reset()`
- `$subscribe()`

## 推荐场景

- 中大型应用状态收口
- 与脚手架 `--store` 模板配套
- 需要统一的全局状态组织方式
