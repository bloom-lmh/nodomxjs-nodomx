# NodomX Monorepo

This repository is now organized as a workspace-style monorepo with sibling packages at the repository root.

## Workspace Layout

- `nodomx`: the core NodomX framework source, examples, dist output, and framework tests
- `nd-compiler`: `.nd` single-file component compiler and CLI
- `rollup-plugin-nd`: Rollup plugin for importing `.nd` files
- `rollup-plugin-dev-server`: Rollup development server and HMR runtime
- `create-nodomx`: starter scaffold generator
- `vscode-extension`: VSCode extension and language server
- `scripts`: shared release and maintenance scripts
- `docs`: repository-level documentation such as release checklists

## Common Commands

Run from the repository root:

```bash
npm install
npm run build:all
npm run test:all
```

Core framework docs now live in [./nodomx/README.md](./nodomx/README.md).

Release guidance lives in [./docs/npm-release-checklist.md](./docs/npm-release-checklist.md).
