# NodomX Monorepo

This repository is organized as a workspace-style monorepo with sibling packages at the repository root.

## Workspace Layout

- `nodomx`: the core NodomX framework source, examples, dist output, and framework tests
- `store`: official application state management package
- `ssr`: official SSR / SSG helpers and payload resume helpers
- `test-utils`: official component mounting and assertion helpers
- `devtools`: browser devtools bridge and overlay
- `nd-compiler`: `.nd` single-file component compiler and CLI
- `rollup-plugin-nd`: Rollup plugin for importing `.nd` files
- `rollup-plugin-dev-server`: Rollup development server and HMR runtime
- `vite-plugin-nodomx`: Vite plugin and Vite HMR helper for `.nd`
- `create-nodomx`: starter scaffold generator
- `vscode-extension`: VSCode extension and language server
- `docs`: VitePress documentation site and release checklists
- `scripts`: shared release and maintenance scripts

## Common Commands

Run from the repository root:

```bash
npm install
npm run test:all
npm run build:all
npm run release:check
```

## Published Sites

- International docs: [https://nodomx-docs.vercel.app/](https://nodomx-docs.vercel.app/)
- Chinese docs: [https://nodomx-e83lc0sk.maozi.io/](https://nodomx-e83lc0sk.maozi.io/)

## Docs Entry Points

- Framework docs: [./nodomx/README.md](./nodomx/README.md)
- Site docs: [./docs](./docs)
- SSR / SSG guide: [./docs/guide/ssr-ssg.md](./docs/guide/ssr-ssg.md)
