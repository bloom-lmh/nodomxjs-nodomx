# 渲染与性能

NodomX 的优化方向不是引入完全不同的运行时，而是在原有模块和模板体系上逐步引入更细粒度的编译期信息与运行时短路能力。

## 当前已经接入的优化

- 静态提升
- block tree
- `patchFlag`
- `childrenPatchFlag`
- `KEYED_FRAGMENT`
- `UNKEYED_FRAGMENT`
- 结构块标记
- keyed diff + LIS
- 依赖路径收集与脏路径更新
- HMR 的组件级热替换和状态恢复

## 结构块分层

以下结构节点会单独形成 block 边界：

- `if`
- `elseif`
- `slot`
- `module`
- `route`
- `router`
- repeat / fragment

这样它们不会再轻易混进普通兄弟节点的通用 diff 路径里。

## 列表优化

推荐写法：

```html
<li x-repeat={{todos}} key={{id}}>
  {{title}}
</li>
```

这样运行时会优先走 keyed fragment 路径，更适合插入、重排和局部替换。

如果没有稳定 `key`，则会落到 unkeyed 路径，更适合纯追加场景。

## 静态提升

静态节点和静态子树现在会被 hoist，并缓存为渲染蓝图。动态节点更新时，静态兄弟子树会被直接跳过或复用。

推荐模板结构：

```html
<section class="card">
  <header class="card-hd">Dashboard</header>
  <div class="card-bd">
    <p>{{count}}</p>
  </div>
</section>
```

## 如何验证优化是否生效

仓库里已经有 smoke test 覆盖：

- 组合式状态更新
- 结构块更新
- keyed diff
- 静态子块复用
- 路由预加载
