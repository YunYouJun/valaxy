# valaxy-addon-girls

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-girls?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-girls)
[![License](https://img.shields.io/npm/l/valaxy-addon-girls)](https://github.com/YunYouJun/valaxy/blob/main/LICENSE)

**English** | [简体中文](https://valaxy.site/zh/addons/girls)

A theme-independent character gallery for [Valaxy](https://valaxy.site). It supports inline arrays and remote JSON sources, three responsive layouts, optional visitor layout switching, configurable notes and motion, loading and failure states, keyboard navigation, and light/dark themes.

## Features

- Three responsive layouts: compact grid, packed bubbles, and orbit.
- Automatic progressive rendering for 100+ entries with native lazy-loaded images.
- Theme-friendly CSS variables, dark mode, reduced motion, and keyboard navigation.
- No decorative image assets: the packed cluster uses CSS and the orbit artwork uses inline SVG.
- Remote JSON and inline data sources with loading, empty, error, and retry states.

## Install

```bash
pnpm add valaxy-addon-girls
```

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonGirls } from 'valaxy-addon-girls'

export default defineValaxyConfig({
  addons: [
    addonGirls(),
  ],
})
```

The addon registers the `ValaxyGirls` component automatically:

```md
---
girls: https://example.com/girls.json
random: true
---

<ValaxyGirls :girls="frontmatter.girls" :random="frontmatter.random" layout="bubbles" switchable>
  <template #header="{ count, isLoading }">
    <header>
      <h2>Lovely characters</h2>
      <p v-if="!isLoading">{{ count }} collected</p>
    </header>
  </template>
</ValaxyGirls>
```

An inline source uses the same fields:

```yaml
girls:
  - name: C.C.
    avatar: https://example.com/cc.png
    from: CODE GEASS
    reason: Her composure and mystery
    url: https://example.com/cc
```

Only `name` is required. Unknown metadata fields are preserved.

## Component props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `autoLoad` | `boolean` | `true` | Automatically reveal progressive batches near the viewport. Set to `false` for a button. |
| `batchSize` | `number` | `24` | Number of characters added by each progressive reveal. |
| `girls` | `GirlEntry[] \| string` | required | Inline entries or a remote JSON URL. |
| `initialCount` | `number` | `24` | Number of cards rendered initially by `grid`. |
| `layout` | `'bubbles' \| 'grid' \| 'orbit'` | `'grid'` | Set the initial layout. Supports `v-model:layout`. |
| `motion` | `'auto' \| 'off'` | `'auto'` | Use restrained layout motion or disable it. `auto` respects reduced-motion preferences. |
| `random` | `boolean` | `false` | Randomize entries after loading. |
| `reasonMode` | `'hidden' \| 'inline' \| 'hover'` | `'hidden'` | Controls how each entry's `reason` is displayed. |
| `renderMode` | `'progressive' \| 'all'` | `'progressive'` | Render entries in bounded batches or create the complete collection. |
| `switchable` | `boolean` | `false` | Let visitors switch between all built-in layouts. |

## Layouts

- `grid` is the backward-compatible compact card grid and the best choice for very large collections.
- `bubbles` packs the complete collection into one size-ranked circular cluster. It never creates a second overflow list.
- `orbit` places up to 24 characters on a constellation and reveals additional entries while scrolling.

Legacy `cloud` and `wings` values are normalized to `bubbles` at runtime, but are no longer part of the public type.

The author controls the initial layout; `switchable` exposes the same choice to visitors:

```md
<ValaxyGirls
  v-model:layout="layout"
  :girls="frontmatter.girls"
  switchable
/>
```

Reasons are hidden by default to keep the gallery compact:

```md
<!-- Always show up to two lines. Recommended when reasons matter on touch screens. -->
<ValaxyGirls :girls="frontmatter.girls" reason-mode="inline" />

<!-- Reveal a floating note on pointer hover or keyboard focus. -->
<ValaxyGirls :girls="frontmatter.girls" reason-mode="hover" />
```

The responsive grid uses up to two columns on regular phones and falls back to one column at `22rem` and below. The packed stage keeps every avatar in the cluster, scales with its container, moves details below the cluster, and stops entrance motion when the user requests reduced motion. Hovering or focusing an avatar raises it above its neighbors and shows both the character name and source work.

For large collections, the grid renders 24 cards initially and automatically appends `batchSize` cards when the reveal sentinel approaches the viewport. Orbit uses the same scroll trigger after its 24 stage avatars. The packed-bubbles layout intentionally renders every lightweight orb at once so the cluster is complete; `renderMode` only affects grid and overflow lists. The trigger uses `IntersectionObserver` with a manual-button fallback; set `:auto-load="false"` to always use the button. Avatar images use native `loading="lazy"` and asynchronous decoding, so a collection of roughly one hundred characters does not require a virtual-list dependency.

Use the explicit `all` mode when the complete collection must exist in the DOM at once. Images outside the viewport remain lazily loaded:

```md
<ValaxyGirls
  girls="https://wives.yunyoujun.cn/girls.json"
  layout="grid"
  render-mode="all"
/>
```

Progressive mode remains recommended for the initial experience. The packed cluster adds no decorative image requests.

For a 100+ entry collection, keep the default progressive mode and tune the two batch limits together:

```md
<ValaxyGirls
  girls="https://wives.yunyoujun.cn/girls.json"
  layout="grid"
  :initial-count="24"
  :batch-size="24"
  :auto-load="true"
/>
```

This renders 24 entries initially, then appends another 24 when the scroll sentinel approaches the viewport. No click is required. To replace automatic loading with an explicit button, set `:auto-load="false"`.

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:layout` | `GirlsLayout` | Emitted for `v-model:layout` after a visitor selects a layout. |
| `layoutChange` | `GirlsLayout` | Emitted alongside `update:layout` for direct event handling. |

```md
<ValaxyGirls
  v-model:layout="layout"
  :girls="frontmatter.girls"
  switchable
  @layout-change="onLayoutChange"
/>
```

## Slots

| Slot | Props | Description |
| --- | --- | --- |
| `header` | `{ count, error, isLoading, random }` | Replaces the optional gallery header while exposing source state. |

```md
<ValaxyGirls :girls="frontmatter.girls">
  <template #header="{ count, error, isLoading }">
    <p v-if="isLoading">Loading collection...</p>
    <p v-else-if="error">Collection unavailable</p>
    <p v-else>{{ count }} characters</p>
  </template>
</ValaxyGirls>
```

## Styling and overrides

Override these CSS custom properties on `.valaxy-girls` to adapt the gallery to a theme:

- `--valaxy-girls-soft`
- `--valaxy-girls-sky`
- `--valaxy-girls-sky-deep`
- `--valaxy-girls-blush`
- `--valaxy-girls-ink`
- `--valaxy-girls-muted`
- `--valaxy-girls-paper`
- `--valaxy-girls-line`

Valaxy users can also replace `ValaxyGirls.vue` in their own `components/` directory through the standard component override mechanism. `ValaxyGirlCard` is exported for direct composition when a different gallery shell is needed.

## Client API

The package exports `useGirls`, `useProgressiveCount`, deterministic layout helpers, `GirlEntry`, `GirlReasonMode`, `GirlsLayout`, `GirlsMotionMode`, `GirlsRenderMode`, `GirlsSource`, and `GirlsHeaderSlotProps`. `useGirls` starts remote requests after mount, cancels stale requests, and keeps server and client markup hydration-safe.

## Documentation and development

- [English guide](https://valaxy.site/addons/girls)
- [简体中文文档](https://valaxy.site/zh/addons/girls)
- [Live demo source](https://github.com/YunYouJun/valaxy/tree/main/demo/yun/pages/girls/index.md)

From the Valaxy monorepo root:

```bash
pnpm --filter valaxy-addon-girls test
pnpm lint
pnpm typecheck
```

## License

[MIT](https://github.com/YunYouJun/valaxy/blob/main/LICENSE) © YunYouJun
