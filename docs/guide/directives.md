# 指令

NodomX 的内置指令主要分成三类：结构型、数据型和路由型。它们既可以写成 `x-*` 指令，也有一部分支持等价的结构元素标签。

## 结构型指令

### `x-repeat`

```html
<li x-repeat={{todos}} key={{id}}>
  {{title}}
</li>
```

或：

```html
<for cond={{todos}} key={{id}}>
  <li>{{title}}</li>
</for>
```

推荐总是带稳定 `key`，这样会命中 keyed fragment 和更稳定的 diff 路径。

### `x-if` / `x-elseif` / `x-else` / `x-endif`

```html
<div x-if={{status === "ready"}}>ready</div>
<div x-elseif={{status === "loading"}}>loading</div>
<div x-else>idle</div>
<div x-endif></div>
```

或使用结构元素：

```html
<if cond={{status === "ready"}}>ready</if>
<elseif cond={{status === "loading"}}>loading</elseif>
<else>idle</else>
<endif />
```

### `x-show`

```html
<section x-show={{visible}}>
  ...
</section>
```

`show` 通过修改 `display` 控制显示，不会像 `if` 一样直接移除节点。

## 数据型指令

### `x-model`

```html
<section x-model="profile">
  <p>{{name}}</p>
</section>
```

它会把当前节点的数据上下文切换到目标模型。

### `x-field`

```html
<input x-field="form.name" />
<textarea x-field="form.bio"></textarea>
<select x-field="form.level"></select>
```

`field` 会建立表单字段和模型之间的双向更新。

### `x-module`

```html
<div x-module="UserCard" $name={{user.name}} />
```

或：

```html
<module name="UserCard" $name={{user.name}} />
```

### `x-slot`

```html
<child-layout>
  <header x-slot="header">title</header>
</child-layout>
```

或：

```html
<slot name="header">title</slot>
```

## 路由型指令

### `x-route`

```html
<a x-route="/report/detail?id=7">Report</a>
```

或：

```html
<route path="/report/detail?id=7">Report</route>
```

### `x-router`

```html
<div x-router></div>
```

或：

```html
<router />
```

## 递归指令

当数据结构是递归树时，可以使用 `x-recur` 或 `<recur>`：

```html
<recur name="menu">
  <div>{{title}}</div>
  <recur ref="menu" />
</recur>
```

## 选择建议

- 列表用 `x-repeat` 或 `<for>`
- 条件渲染优先用 `if/elseif/else`
- 只切换显示状态时用 `show`
- 表单统一用 `field`
- 子模块通信优先用模块属性、slot 和 `provide/inject`
