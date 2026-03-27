# 模板语法

组合式 API 和 `.nd` 的加入，并没有改变 NodomX 的模板语法。模板仍然围绕插值、指令、事件、自定义元素和模块节点来工作。

## 文本插值

```html
<p>Hello {{name}}</p>
<p>{{count + 1}}</p>
<p>{{user.firstName + " " + user.lastName}}</p>
```

插值表达式会在模板编译阶段转成表达式节点，并自动参与依赖收集。

## 属性表达式

属性里同样可以放表达式：

```html
<div class={{active ? "active" : "idle"}}></div>
<li key={{item.id}}></li>
<child-panel $title={{title}} mode="compact" />
```

推荐规则：

- 静态值直接写字符串
- 动态值通过 `{{}}` 传入
- 列表项尽量提供稳定 `key`

## 模块属性与 `$` 前缀

给子模块传值时，`$` 前缀会被归入子模块的数据输入：

```html
<user-card $name={{user.name}} $id={{user.id}} type="simple" />
```

这意味着：

- `$name`、`$id` 属于传入子模块的数据
- 其他普通属性则作为 props / attrs 保留

## 内置结构元素

除了 `x-*` 指令，NodomX 还支持一组语义化结构标签：

- `<module name="UserCard" />`
- `<for cond={{list}} />`
- `<if cond={{ok}} />`
- `<elseif cond={{next}} />`
- `<else />`
- `<endif />`
- `<show cond={{visible}} />`
- `<slot name="header" />`
- `<route path="/report" />`
- `<router />`

这些结构型节点在编译阶段会被打上结构块标记，运行时可用更稳定的 block 边界做定向更新。

## 与 `.nd` 的关系

`.nd` 的 `<template>` 区块仍然完全使用这套模板语法：

```html
<template>
  <section class="card">
    <h2>{{title}}</h2>
    <button e-click="inc">+1</button>
  </section>
</template>
```

换句话说，`.nd` 只是让模板、逻辑、样式写在同一个文件里，而不是引入另一套渲染语法。
