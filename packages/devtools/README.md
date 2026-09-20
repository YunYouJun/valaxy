# @valaxyjs/devtools

Valaxy's post, collection, and source-config tools, powered by [Devframe](https://devfra.me/) and hosted in [Vite DevTools](https://devtools.vite.dev/).

## Using Valaxy

Run `valaxy dev` and open **Valaxy** in the Vite DevTools floating dock. On first connection, enter the one-time code shown in the terminal. Vue DevTools remains available for Vue component/state inspection.

The same UI is available at `<base>__valaxy_devtools__/`. Directly opened pages can manage files; page highlighting requires an embedded panel or a same-origin opener. Set `devtools: false` in `valaxy.config.ts` to disable the tools. Production builds exclude them; MCP is disabled by default.

Primary pages (including categories and tags) live in the native **Valaxy** sidebar. Top-level navigation uses Hub's public [shared-iframe soft navigation](https://devfra.me/guide/client-context#shared-iframe-soft-navigation): one `frameId` and a localized `subTabs` manifest keep the router and host selection synchronized without reloading the panel. Page-level filters, such as published/draft posts, remain inside their page. Direct opens use `@antfu/design`'s `LayoutSideNav` with the same entries; narrow standalone windows use a navigation dialog.

Embedded panels discover their registered frame-navigation anchor through the public `devframe:docks` shared state. This also handles Hub restoring an older panel URL after an upgrade; navigation ownership does not depend on a query parameter. An iframe without that registered host keeps its local navigation.

Unsaved frontmatter drafts are retained per file when switching pages, posts, or addon panels in the current session. Saving remains explicit. Reloading the browser clears these in-memory drafts; external file changes offer an explicit reload action.

**Page Debug** replaces the Yun theme's default floating Valaxy Debug widget. It shows the site's viewport and matching breakpoints, current route/query/params, live frontmatter, and the runtime site summary and theme configuration. It follows the browser page rather than the article selected for editing. These read-only snapshots arrive over the local page channel; the current page is not shared across browser tabs. Direct opens without a parent/opener show an empty state. The existing **Config** page still edits source files. The legacy `ValaxyDebug` component remains available for themes that explicitly mount it.

JSON inspection and addon command/configuration previews use the official [`@devframes/service-shiki`](https://devfra.me/add-ons/services/shiki) service, declared by the Valaxy Devframe for both native Vite DevTools and standalone hosts. Code is sent to the local development server for highlighting and caching; Shiki grammars and themes stay out of the DevTools client bundle. `VDCodeBlock` renders the service's escaped HTML with Vitesse light/dark colors following the shared theme preference. Shell commands and TypeScript/JavaScript configurations request their grammars on demand. Pending or unavailable highlighting falls back to current plain text; outdated responses cannot replace newer page data.

## Addon marketplace

The **Addons** page is always available and shares its official/community catalog with the documentation site. Catalog cards use the same icons as the documentation gallery, bundled by UnoCSS from the shared catalog; addons outside the catalog use a generic puzzle icon. It displays direct installed dependencies and enabled addons independently of extension-panel registration, with search, source/tag filters and package/documentation links.

Authenticated package actions use pnpm and require a server-generated preview before execution. Installation pins the reviewed registry version and does not enable the addon automatically. Removal previews supported static configuration edits and rejects remaining imports, dynamic declarations and indirect dependencies. Existing content is preserved. Package/config/lockfile changes invalidate an old preview; duplicate confirmations reuse the same job, workspace jobs are serialized, and logs are bounded. Failed removals restore configuration only when it is still unchanged and the dependency remains declared.

Other package managers remain browse-only. Lifecycle scripts are disabled; new addon options and any required scripts must be reviewed using the addon documentation. Restart the preview after changing addon configuration. Jobs run in the development server process, so after restarting that process, inspect the refreshed dependencies before retrying an interrupted operation.

## Vite integration

Requires Vite 8.3+. Valaxy configures this automatically. For other hosts:

```ts
import ValaxyDevtools from '@valaxyjs/devtools'
import { defineConfig } from 'vite'

export default defineConfig({
  devtools: { apply: 'serve', mcp: false },
  plugins: [ValaxyDevtools({ userRoot: '/absolute/path/to/blog' })],
})
```

Install `@vitejs/devtools` alongside Vite when enabling the native host. If Vite DevTools is disabled, the plugin serves the same authenticated Devframe directly at `<base>__valaxy_devtools__/` without a dock. Do not register an additional Valaxy Devframe in that process.

`createValaxyDevframe` is exported from `@valaxyjs/devtools/definition` for other Devframe hosts. `@valaxyjs/devtools/page` exports `createValaxyPageBridge(router, { getDebug? })` for page context; the optional callback provides a `ValaxyPageDebug` snapshot. Call `sync()` when non-route diagnostics change and `close()` on teardown. Valaxy registers this automatically, including resize/config updates and cleanup. `@valaxyjs/devtools/rpc` retains the public operation types.

RPC reads source configuration, not Valaxy's fully merged runtime config. Markdown operations validate paths within the site and keep the Markdown body. A Vite watcher refreshes file lists; an editor draft is retained when the file changes externally, with an explicit reload action.

## MCP content tools

Set `mcp: true` in `valaxy.config.ts` to enable the built-in, local read-only MCP endpoint at `<base>__valaxy_mcp`. This is independent of the `devtools` panel setting and runs only during development. The terminal prints the connection URL and required `Origin` header. Dependencies are included; no extra MCP package installation is needed.

The isolated endpoint exposes `valaxy_list_posts`, `valaxy_search_pages`, `valaxy_read_page`, `valaxy_list_collections`, `valaxy_inspect_page`, and `valaxy_check_page`. Inspection and checks use Valaxy's route pipeline to report resolved article state and actionable diagnostics. The same operations are available through `valaxy inspect/check --file pages/posts/hello.md --json` and `createContentService()` from `valaxy/node`. It does not expose management RPCs, addon tools, shared state, or source configuration. Drafts are excluded unless `mcp: { includeDrafts: true }` is configured; hidden and protected pages remain excluded. Use `mcp: false` and restart to disable it.

For a custom Vite host, add `ValaxyMcp({ userRoot })` from `@valaxyjs/devtools/mcp` to `plugins`. This standalone form exposes the four source-reading tools; supplying the optional `content` provider adds framework inspection/checking. Valaxy wires this provider automatically. Do not enable the Vite DevTools host's MCP option to expose these content tools; they use a separate context and endpoint. See [Work with AI](https://valaxy.site/guide/work-with-ai#mcp) for client configuration, scope, and limits.

## Development

The UI uses the same [`@antfu/design`](https://github.com/antfu/design) components, styles, and UnoCSS preset as Devframe Hub UI. The preset is scoped to the DevTools SPA; blog/theme styles are unaffected. Buttons, selects, checkboxes, textareas, dialogs, cards, and feedback use the public components. Native inputs and the remaining Reka controls preserve Valaxy's datalist, numeric, and date behavior while using the same semantic tokens.

Same-origin panels share the Hub's `devframes-color-scheme` preference. The optional `ConnectionMeta.configs.ui.branding.primaryColor` sets `--devframe-primary`, with a Vite-colored fallback when opened without a Hub. This does not install another Hub. Narrow panels stack the list and editor vertically.

Keep UI colors on the preset's `bg-base`, `bg-raised`, `color-muted`, `border-base`, and primary tokens. The dedicated `src/client/uno.config.ts` is loaded through UnoCSS so the design package's TypeScript preset is transpiled correctly. `colorjs.io` is its build-time peer dependency.

From the repository root:

```bash
pnpm run build
pnpm demo          # built panel in a real Valaxy site
pnpm devtools     # frontend HMR on http://localhost:5001, demo/yun data
```

Use the terminal code to authorize the development SPA. There is no separate REST proxy to configure.

```bash
pnpm exec vitest run test/devtools
pnpm run typecheck
pnpm run build:devtools
pnpm run test:devtools # real registry/pnpm operations in a temporary project
```

## Addon extensions (experimental API v1)

Vite DevTools remains the default host. Its native Dock has a **Valaxy** group containing the main panel's page entries and independent addon panels. The page entries share one iframe; each addon panel retains its own iframe. Valaxy owns the blog UI and extension API; it does not create a second Hub. The same panels can open directly, including when Vite DevTools is disabled.

An enabled addon opts in with a lazy Node-side `devtools` loader. Put it on the object returned by the addon factory, or on an addon entry in `valaxy.config.ts`:

```ts
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  addons: [{
    name: 'valaxy-addon-example',
    devtools: () => import('valaxy-addon-example/devtools'),
  }],
})
```

The loader receives `{ userRoot, addonRoot, options }`. Its result is a plugin or a module whose default export is a plugin. Disabled addons and production builds do not load it. A bare addon name alone does not discover a DevTools entry; use the addon factory or the explicit loader above. Restart the dev server after changing registration.

```ts
import { fileURLToPath } from 'node:url'
import { defineValaxyDevtoolsPlugin } from '@valaxyjs/devtools/plugin'

export default defineValaxyDevtoolsPlugin({
  apiVersion: 1,
  id: 'example',
  name: 'Example',
  panels: [{
    id: 'overview',
    title: 'Example Overview',
    icon: 'ph:puzzle-piece',
    clientAssets: fileURLToPath(new URL('./client', import.meta.url)),
  }],
  editor: {
    fields: [{ key: 'reviewNote', label: 'Review note', type: 'textarea', maxLength: 160 }],
    actions: [{
      id: 'check',
      label: 'Check note',
      run: ({ draft }) => ({ message: draft.reviewNote ? 'Note is present.' : 'Add a review note.', severity: 'info' }),
    }],
  },
  async setup({ data }) {
    await data.onChanged(() => {
      // Invalidate addon-owned derived data here.
    })
  },
})
```

Build panel assets with Vite `base: './'` and hash routing. Ship the resulting directory in the addon package. Each panel uses a namespaced URL under `<base>__valaxy_addons__/<plugin>/<panel>/`; sibling mounts avoid overlapping the main SPA's history fallback. IDs must use lowercase letters, digits and hyphens, starting with a letter. Valaxy rejects duplicate IDs, conflicting editor fields and missing built assets with a startup error.

Inside a registered panel:

```ts
import { connectValaxyDevtools, onValaxyPageChanged } from '@valaxyjs/devtools/client-api'

const { client, data } = await connectValaxyDevtools({ webmcp: false })
const posts = await data.getPostList()
const page = await data.getPageData(posts.posts[0].filePath)
const config = await data.getConfig()
const stop = await data.onChanged(() => { /* refresh derived views */ })
const stopPage = onValaxyPageChanged((page) => { /* page is undefined without site context */ })

// On panel teardown:
stop()
stopPage()
client.close?.()
```

`connectValaxyDevtools()` discovers the main Valaxy endpoint from a registered panel's URL, including direct standalone opens. Pass `baseURL` explicitly when serving a panel from a custom URL. An already connected Devframe panel can instead call `createValaxyDevtoolsClient(client)`. Both expose the same read-only API as Node `setup({ data })`: options, posts, page frontmatter, collections, source configuration, and `onChanged()`. The subscription is an invalidation signal; refetch data instead of expecting file contents in the event. Handle connection status and refresh on reconnect. Always unsubscribe on teardown. Node data subscriptions are also cleaned up automatically when Valaxy closes.

Page context stays local to the current browser via `onValaxyPageChanged()`. It is not server-global state and is undefined for a panel opened without a site parent/opener. `getPageData()` accepts the absolute file path returned by the post list, or a path such as `pages/posts/hello.md`; it does not interpret route URLs as filenames. Config reads reflect source files, not the fully merged runtime configuration.

For addon-specific RPC, `setup({ rpc })` accepts Devframe `defineRpcFunction()` definitions. A function named `inspect` in addon `example` becomes `valaxy:addon:example:inspect`. Declare the corresponding Devframe RPC type augmentation in the addon when using typed client calls. Register timers/listeners with `onDispose()`. Other hosts using `createValaxyDevframe()` must call the returned definition's `dispose()` during teardown; the Vite adapter does this on close and restart.

Editor fields support text, textarea, boolean, number and select. They are optional top-level frontmatter values, rendered in their addon's group, with explicit Add/Remove controls. Opening a post adds no defaults. Values are validated on the server for normal saves, batch edits and migration. Core editor fields and dangerous keys cannot be replaced. This first version has no arbitrary component injection or automatic saves. Actions receive the saved `page`, unsaved `draft` and read-only `data`; they return a message and severity. An action does not save the draft. An addon is trusted project code, not a sandbox.

The UI retains the shared Hub design system. Publication state uses explicit colors (published green, draft amber); tags and categories use deterministic identity colors. Accent text and subtle surfaces adapt to light/dark mode, while selection and focus continue to use the host brand color.

See the runnable [SEO addon example](./examples/seo-addon/README.md) for a complete independent panel, change subscription, four editor field types and a draft check. It is a reference implementation, not a production SEO feature.
