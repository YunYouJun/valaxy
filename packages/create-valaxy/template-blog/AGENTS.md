# AGENTS.md

Instructions for coding agents working in this Valaxy blog. This is a user site, not the Valaxy framework repository.

## Commands

Use Node.js `>=22.12.0` and pnpm `>=10.26.0`. Keep `pnpm-workspace.yaml`; it records dependency build permissions.

```bash
pnpm install
pnpm dev
pnpm build
pnpm serve
pnpm exec valaxy new your-post-slug
```

`pnpm dev` serves the site at the `Preview` address, usually `http://localhost:4859/`. `pnpm build` writes a static site to `dist/`. `pnpm serve` previews that output and does not rebuild it.

## Where to edit

- `pages/posts/` — Markdown posts. Frontmatter between `---` sets title, date, tags, and other metadata.
- `site.config.ts` — site title, author, description, and the production `url` (`defineSiteConfig`).
- `valaxy.config.ts` — theme and framework options (`defineValaxyConfig`). Yun's large home-page text is `themeConfig.banner.title`.
- `styles/`, `components/`, `layouts/`, and `locales/` — optional overrides. A file here replaces the theme file with the same name.

Replace `https://example.com/` in `site.config.ts` before publishing. The sitemap, RSS, and `llms.txt` use that address.

## AI-readable output

This project sets `llms.enable: true`. `pnpm build` writes `dist/llms.txt`, `dist/llms-full.txt`, and raw post Markdown under `dist/`. Those files publish post Markdown with the site. Turn that off with `llms.enable: false` in `site.config.ts`.

MCP is off. The commented example in `valaxy.config.ts` points at https://valaxy.site/guide/work-with-ai#mcp. Leave it commented unless you want the local read-only dev server.

## Conventions

- Install and add packages with pnpm.
- Use the `defineSiteConfig` and `defineValaxyConfig` helpers from `valaxy`.
- Check unfamiliar APIs against the installed package or https://valaxy.site/guide/getting-started.
- Keep edits inside this site. Do not change `node_modules` or assume framework defaults from an older scaffold.
