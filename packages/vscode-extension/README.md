# NodomX ND VSCode Extension

Local VSCode support for `.nd` single-file components.

Features:

- registers the `.nd` language
- highlights `<template>`, `<script>`, `<style>`
- highlights `{{ ... }}` expressions inside template blocks
- provides the `NodomX: Compile Current .nd File` command

The compile command writes a sibling file such as:

```text
App.nd -> App.nd.gen.mjs
```
