# Theme contract

The installed Valaxy source and declarations are authoritative. This recipe targets the 1.0 release-candidate API; verify the version before applying it to an older theme.

## Source package and consumer

The official starter separates `theme/` from `demo/`. A theme is published as source, not a precompiled application. Include its `components`, `layouts`, `pages`, `setup`, `styles`, `client`, configuration, types and other imported source in the package `files` list. Export types from the root entry and browser-safe composables from `./client`; do not pull Node configuration into browser imports. Declare runtime dependencies in the theme and Valaxy/Vue compatibility as peer dependencies.

`demo/valaxy.config.ts` selects `theme: '<name>'`; its package depends on `valaxy-theme-<name>: workspace:*`. `demo/site.config.ts` contains the blog identity. Theme defaults belong in `theme/valaxy.config.ts`, using `defineTheme<ThemeConfig>()`, while consumer overrides use `defineValaxyConfig<ThemeConfig>()` or `theme.config.ts`.

## Rendering

- `components/ValaxyMain.vue` accepts `frontmatter: Post` and optional `data?: PageData`. Render `<ValaxyMd :frontmatter="frontmatter"><slot /></ValaxyMd>` and preserve useful named slots. Do not replace the compiled Markdown with a second parser.
- `components/layout.vue` is the shared shell. `layouts/home.vue`, `post.vue`, and `default.vue` compose the shell and `<RouterView />`/slots. Avoid nested `<main>` elements when the Markdown wrapper owns the landmark.
- `pages/index.vue` can provide the theme's home page. User files override same-name theme files.
- The optional `data` prop is not populated by every Valaxy release. Use the exported `useOutline()` for the live article outline; it reads rendered headings after content updates and therefore appears after hydration. Do not assume `data.headers` exists. Keep `useOutline()` in a dedicated outline child component: its content-update callback changes reactive state; placing it in the Markdown parent can retrigger `ValaxyMd` updates.
- `useSiteStore().postList` provides shared framework post state (including publication filtering and content updates); `usePostList()` is the lower-level alternative. Verify their signatures in the installed version. `useSiteConfig()` reads site identity; `useConfig<ThemeConfig>()` provides typed theme configuration.
- `setup/main.ts` uses `defineAppSetup()` for client setup and required public style imports. A `styles/index.ts` entry is discovered by Valaxy; choose one owner for each style import to avoid loading it twice.
- Check `valaxy/client/styles/common/index.scss` and individual code/Markdown style exports in the installed version before using them. Use theme-specific CSS variables without breaking `--va-*` integration.

## Acceptance fixture

Provide home, post and ordinary Markdown pages, an empty archive case, a draft, a long title and a long article. Verify code blocks, headings/outline, tags, real dates, images, mobile layout and focus visibility. Default/home/post routing should work without invented frontmatter fields. Use `valaxy inspect/check` when those commands exist in the installed version; otherwise rely on the real demo build and browser checks.

Valaxy builds statically. Route links should use RouterLink/AppLink for base-aware navigation. Browser APIs must be guarded. Avoid nondeterministic server/client markup from random values, locale-dependent dates or dark-mode-only initial content.
