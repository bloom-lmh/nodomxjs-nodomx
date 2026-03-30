# `create-nodomx`

Starter generator for NodomX applications.

## Usage

```bash
npm create nodomx@latest my-app
npx create-nodomx@latest my-app
create-nodomx my-app
```

## Common examples

```bash
create-nodomx my-app --install
create-nodomx my-app --router --store
create-nodomx my-app --router --store --typescript
create-nodomx my-app --template basic
create-nodomx my-lib --template library
create-nodomx my-docs --template docs
create-nodomx my-ssr-app --template ssr
create-nodomx my-app --package-mode local --install
```

`registry` mode writes semver package ranges for publish-ready templates.  
`local` mode writes `file:` dependencies so the template can be tested against this repository directly.

## Templates

- `vite` (default): modern Vite-based starter using `vite-plugin-nodomx`
- `basic`: legacy Rollup starter using `@nodomx/rollup-plugin-nd` and the built-in dev server
- `library`: Vite library preset for publishing reusable `.nd` components
- `docs`: VitePress documentation preset
- `ssr`: Vite + `@nodomx/ssr` starter with static generation scripts

## Feature flags for `vite`

- `--router`: scaffold `src/router` and starter views
- `--store`: scaffold the official `@nodomx/store` setup in `src/stores`
- `--router --store`: wire both together for route + store starter usage
- `--typescript`: switch the Vite starter to `main.ts`, `vite.config.ts`, `tsconfig.json`, and typed `.nd` imports

## Default Vite starter structure

- `src/components`
- `src/styles`
- `src/layouts` when `--router` is enabled
- `src/router/routes.(js|ts)`
- `src/stores/index.(js|ts)` when `--store` is enabled
