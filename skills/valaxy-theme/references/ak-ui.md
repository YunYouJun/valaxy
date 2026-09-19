# AK UI theme recipe

Use this recipe only when AK UI or an Arknights-inspired design is requested. The reference implementation is `valaxyjs/valaxy-theme-arknights`; inspect its current status rather than assuming an npm release exists.

- Documentation: https://ak-ui.yyj.moe/
- Public skill: `pnpm dlx skills add YunYouJun/ak-ui --skill ak-ui`
- CSS package: `@yunyoujun/ak-ui`; check the current published version before installing it in the theme package.

Prefer `system` intensity: asymmetric layout, neutral paper/graphite surfaces, purposeful cut corners and functional signal colors. Keep long-form reading calmer than the homepage. Use real archive metadata instead of fictional telemetry.

Import `@yunyoujun/ak-ui/style.css` when consuming `.ak-*` primitives, or `tokens.css` when using only its token foundation. These are CSS imports, not a Vue component library. Add Vue Registry/headless components only for interactions that need them. Read the installed package or official docs for exact token/class names.

Map site/theme colors into semantic `--ak-surface-*`, `--ak-text-*`, `--ak-signal-*`, font, spacing and focus tokens. Keep focus visible outside clipped surfaces, touch targets usable, article contrast legible, and light/dark appearance coherent. Recompose the archive for narrow screens.

Use original geometry and user-owned imagery. Do not download game logos, characters or screenshots as template assets. Identify the example as an independent, unofficial theme. Validate both the theme's public CSS dependency and Valaxy's SSR/SSG build in a fresh consumer.


## AK UI 1.1 interactions

Read the current AK UI Skill's `references/site.md` for website interactions. `@yunyoujun/ak-ui/site` exposes framework-neutral controllers; CSS classes and data attributes do not initialize them. Initialize `createMobileMenu` after mounting with a native dialog and trigger, and call `destroy()` on unmount. Preserve keyboard focus, Escape/link dismissal, desktop breakpoint closing, reduced motion and a usable no-JavaScript navigation fallback.

The Arknights example implements this at `theme/components/ArknightsMobileNav.vue`. Its bilingual usage guide is https://valaxy.site/themes/arknights (Chinese: https://valaxy.site/zh/themes/arknights). It is a source example: use a packed archive until an npm release is verified. Do not add full-page section navigation, particle fields or loading controllers unless the blog needs them.
