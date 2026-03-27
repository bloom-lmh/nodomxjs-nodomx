# 事件与方法

事件仍然使用 `e-*` 绑定，不需要引入新的事件语法。

## 基本写法

```html
<button e-click="save">Save</button>
<input e-input="syncDraft" />
```

在模块中：

```ts
class FormModule extends Module {
  save(model, dom, evObj, event) {
    console.log(model, dom, evObj, event);
  }
}
```

事件处理默认会收到 4 个参数：

1. 当前事件对应的数据模型
2. 当前命中的虚拟 DOM 节点
3. NodomX 事件对象
4. 原生 DOM Event

## 事件修饰参数

事件串支持以下附加参数：

- `delg`
- `nopopo`
- `once`
- `capture`

例如：

```html
<button e-click="save:once">Save once</button>
<li e-click="select:delg">...</li>
```

含义：

- `delg`: 代理事件
- `nopopo`: 阻止冒泡
- `once`: 只执行一次
- `capture`: 捕获阶段触发

## 普通方法

模块方法也可以在表达式中使用：

```html
<div class={{genClass(type)}}>{{name}}</div>
```

```ts
genClass(type) {
  return type === 1 ? "active" : "idle";
}
```

## 与 `<script setup>` 配合

在 `.nd + <script setup>` 中，顶层函数会自动暴露给模板：

```html
<script setup>
const inc = () => {
  count.value++;
};
</script>

<template>
  <button e-click="inc">+1</button>
</template>
```

## 模块方法

除了模板事件方法，模块实例本身还提供一组常用方法：

- `get(path)`
- `set(path, value)`
- `watch(path, callback)`
- `getModule(nameOrId)`
- `getModules(name?)`
- `getRenderedDom(key)`
- `getNode(key)`
