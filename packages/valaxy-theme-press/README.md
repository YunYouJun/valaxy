# valaxy-theme-press

Documentation theme for [Valaxy](https://valaxy.site).

It is inspired by [VitePress](https://vitepress.dev), and it powers the Valaxy documentation site.

## Install

```bash
pnpm add valaxy-theme-press
```

```ts
import type { PressTheme } from 'valaxy-theme-press'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<PressTheme.Config>({
  theme: 'press',
  themeConfig: {
    logo: '/favicon.svg',
  },
})
```

## Links

- [Documentation](https://valaxy.site/themes/press)
- [中文文档](https://valaxy.site/zh/themes/press)
- [Preview](https://press.valaxy.site)
- [Source](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press)

## Reference

- [vitepress](https://vitepress.dev/)
- [nextjs](https://nextjs.org/)

## Native theme styles

Press ships its own documentation styles and `PressTheme.SidebarItem` type; it does
not require the `vitepress` package. Theme CSS uses `--press-*` variables and
`.press-doc`. When updating custom styles, replace `--vp-*` and `.vp-doc` with
these names. Valaxy’s shared Markdown code-group classes remain supported.
See [third-party notices](./THIRD-PARTY-NOTICES.md) for the adapted styles’ source
and license.
