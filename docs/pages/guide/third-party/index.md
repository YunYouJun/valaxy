---
title: Third Party Integration
categories:
  - third
end: false
top: 99
aplayer: true
---


## Search


### Local Search (Based on fuse.js)


Valaxy has built-in local search based on [fuse.js](https://fusejs.io/). The local cache should be generated in advance via `valaxy fuse`.

> `valaxy fuse` generates `fuse` in the `public` directory by default.
> When executing `valaxy build`, `valaxy fuse` will be executed automatically.


#### Setup


```ts [site.config.ts] {7}
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  search: {
    enable: true,
    // Set provider to 'fuse'
    provider: 'fuse',
  },
})
```

- Add fuse generation script in your `package.json`

```json {7,9} [package.json]
{
  "name": "yun-demo",
  "valaxy": {
    "theme": "yun"
  },
  "scripts": {
    "build": "npm run build:ssg",
    "build:ssg": "valaxy build --ssg",
    "fuse": "valaxy fuse",
    "rss": "valaxy rss"
  },
  "dependencies": {
    "valaxy": "latest",
    "valaxy-theme-yun": "latest"
  }
}
```


### Algolia DocSearch


Algolia is an online third-party search service. You need to apply for the `ID` and `Secret` by yourself.

> [DocSearch](https://docsearch.algolia.com/) Only technical document applications are accepted generally.

Valaxy provides a quick integration plug-in: [valaxy-addon-algolia](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia) (Currently only DocSearch is supported).


## Music Player


> Provided by the [valaxy-addon-meting](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-meting) addon, based on [APlayer](https://github.com/DIYgod/APlayer) and [MetingJS](https://github.com/metowolf/MetingJS).

::: warning Migrated to an addon
The legacy core `aplayer: true` frontmatter switch was **removed in v1.0**. The music player now lives in the `valaxy-addon-meting` addon — add it to your config to use it.
:::

Install and enable the addon:

```ts
// valaxy.config.ts
import { defineConfig } from 'valaxy'
import { addonMeting } from 'valaxy-addon-meting'

export default defineConfig({
  addons: [
    addonMeting({
      // set `global: true` for a fixed player shown on every page
      global: false,
    }),
  ],
})
```

Then drop a `<meting-js>` element anywhere in an article (e.g. a song from NetEase Cloud Music):

```html
<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>
```

> Tip: the `aplayer: true` frontmatter is still honored by the addon to toggle the global fixed player on a per-page basis. See the [addon README](https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-meting) for all options.

Here is a demo:

<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>

> More info see [Option | MetingJS](https://github.com/metowolf/MetingJS#option)


## Google Statistics


> Refer to [Custom Extensions | Extending Client Context](/guide/custom/extend#extending-client-context)

You can add Google Statistics by using Vue plug-in directly.

For example:

- Install the dependency: `pnpm add vue-gtag-next`
- Create `setup/main.ts`

```ts
// setup/main.ts
import { defineAppSetup } from 'valaxy'
import { install as installGtag } from './gtag'

export default defineAppSetup((ctx) => {
  installGtag(ctx)
})
```

- Create `setup/gtag.ts`

```ts
import type { UserModule } from 'valaxy'
import VueGtag, { trackRouter } from 'vue-gtag-next'

export const install: UserModule = ({ isClient, app, router }) => {
  if (isClient) {
    app.use(VueGtag, {
      property: { id: 'G-1LL0D86CY9' },
    })

    trackRouter(router)
  }
}
```


More info see [vue-gtag-next](https://github.com/MatteoGabriele/vue-gtag-next).
