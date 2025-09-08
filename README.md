# 3D LLM New Frontend

A modern Vue 3 + TypeScript + Tailwind CSS frontend for the 3D LLM project, featuring the comprehensive Aetosky Design System.

## 🎨 Design System

This project includes a complete design system with:
- **Consistent Color Palette**: Dark theme with Aetosky green (`#BEF975`) as primary
- **Typography Scale**: Inter font family with systematic sizing
- **Component Library**: Pre-built, accessible UI components
- **Design Tokens**: Comprehensive system for spacing, colors, and typography
- **TypeScript Support**: Full type safety for design system APIs

👉 **[View Design System Documentation](./DESIGN_SYSTEM.md)**

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
