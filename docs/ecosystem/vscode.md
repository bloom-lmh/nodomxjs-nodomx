# VSCode 插件

扩展包名：`nodomx-nd-vscode`

Publisher：`SWUST-WEBLAB-LMH`

Marketplace：
[SWUST-WEBLAB-LMH.nodomx-nd-vscode](https://marketplace.visualstudio.com/items?itemName=SWUST-WEBLAB-LMH.nodomx-nd-vscode)

## 已支持能力

- `.nd` 语法高亮
- HTML 标签与属性补全
- `defineProps / defineEmits / defineModel / defineSlots / defineExpose` 补全
- 指令与事件补全
- hover / references / rename / document symbols / formatting
- semantic tokens
- 结构化 template diagnostics
- 跨组件 `props / emits / slots` 契约检查
- contract-aware quick fix / refactor
- 保存自动编译

## 本地调试

```bash
cd vscode-extension
npm run build
```

然后在 VSCode 里按 `F5` 启动扩展开发宿主。

## 本地打包

```bash
npm run package:extension
```

产物在：

```text
vscode-extension/nodomx-nd-vscode-<version>.vsix
```

## 发布到 Marketplace

```bash
cd vscode-extension
npm run publish:marketplace
```

如果你不想每次手动传 token，可以先把 `VSCE_PAT` 存到本地凭证文件，再直接执行发布脚本。

## 推荐设置

- `nodomx.nd.enableLanguageServer`
- `nodomx.nd.compileOnSave`
- `workbench.iconTheme.showLanguageModeIcons`
