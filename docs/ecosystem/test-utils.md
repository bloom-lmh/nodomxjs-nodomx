# `@nodomx/test-utils`

`@nodomx/test-utils` 用于在 Node + JSDOM 环境中挂载 NodomX 组件并做交互断言。

## 安装

```bash
npm install -D @nodomx/test-utils
```

## 基本示例

```js
import { mount } from "@nodomx/test-utils";
import App from "./App.nd";

const wrapper = await mount(App);
await wrapper.trigger("button", "click");

console.log(wrapper.text());
```

## 当前 API

- `mount()`
- `trigger()`
- `text()`
- `exists()`
- `flush()`

## 适用场景

- 组件交互 smoke test
- starter / 模板测试
- CI 里的快速渲染断言
