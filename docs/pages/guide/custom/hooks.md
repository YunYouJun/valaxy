---
title: Hooks
categories:
  - custom
end: false
---

::: tip

Valaxy provides a hooks system that allows you to customize various stages of the lifecycle.

:::

## Lifecycle


> Hooks are executed in the order listed below.

### Build Time

| Hook | Arguments | Description |
| ---- | --------- | ----------- |
| `options:resolved` |  | Called after Valaxy config is resolved. |
| `config:init` |  | Called after Vite config is initialized (based on Valaxy Options). |
| `vue-router:extendRoute` | `route: EditableTreeNode` | Called when extending each route (after `.md` frontmatter/excerpt is processed). |
| `vue-router:beforeWriteFiles` | `root: EditableTreeNode` | Called before route files are written. |
| `md:afterRender` | `ctx: MdAfterRenderContext` | Called after a markdown page has been loaded and its frontmatter/excerpt resolved. Useful for addons that need to inspect or extend page metadata. |
| `build:before` |  | Called before the build starts. Only fires during `valaxy build`. |
| `build:after` |  | Called after the build completes. Only fires during `valaxy build`. |
| `content:before-load` | | `@experimental` Called before all Content Loaders start fetching. |
| `content:loaded` | | `@experimental` Called after all Content Loaders have finished. |

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  hooks: {
    'config:init': () => {
      console.log('config:init')
    },
  }
})
```

### App Client {#app-client}

Valaxy does not currently have a client-side hooks system. Client-side extensions are done via `defineAppSetup`, which provides an `AppContext` (including `app`, `router`, `routes`, etc.) for customizing the Vue application.

```ts [setup/main.ts]
import { defineAppSetup } from 'valaxy'

export default defineAppSetup(({ app, router, routes }) => {
  // install Vue plugins, register global components, etc.
})
```
