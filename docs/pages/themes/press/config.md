---
title: Theme Press Config
categories:
  - theme
---

## Theme Config Reference {#theme-config-reference}

The table below lists the Press-specific `themeConfig` options. Site-wide options such as `title`, `url`, `search`, and `lastUpdated` still live under `siteConfig`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `logo` | `string` | `''` | Logo shown in the top nav. Use a public path such as `/favicon.svg`. |
| `colors.primary` | `string` | `'#0078E7'` | Primary color injected into Press SCSS and Valaxy theme variables. |
| `nav` | `NavItem[]` | `[]` | Top navigation links and dropdown groups. |
| `sidebar` | `Sidebar` | `[]` | Left sidebar. Supports category names, explicit trees, and multi-sidebars keyed by path. |
| `editLink.pattern` | `string` | Valaxy docs repository edit URL | URL template for the bottom "Edit this page" link. `:path` is replaced by the page relative path. |
| `editLink.text` | `string` | Locale text | Custom edit-link label. |
| `footer.message` | `string` | `undefined` | Footer message. HTML is allowed. |
| `footer.copyright` | `string` | `undefined` | Footer copyright text. HTML is allowed. |
| `socialLinks` | `SocialLink[]` | `[]` | Icon links rendered in the nav. Icons use UnoCSS icon classes such as `i-ri-github-line`. |
| `locales` | `Record<string, LocaleSpecificConfig>` | `undefined` | Locale switcher data and per-locale `themeConfig` overrides. |
| `i18nRouting` | `boolean` | `false` | Preserve the current route path when switching locales. |

## Home Page {#home-page}

Use `layout: home` and configure the hero and features in frontmatter.

```md [pages/index.md]
---
layout: home

title: Acme Docs

hero:
  name: Acme
  text: Build faster with Acme
  tagline: Everything you need to install, configure, and extend Acme.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
      type: fly
    - theme: alt
      text: View on GitHub
      link: https://github.com/acme/project

features:
  - icon: i-logos:vitejs
    title: Fast
    details: Powered by Vite and Valaxy.
  - icon: i-logos:vue
    title: Extensible
    details: Use Vue components directly in Markdown.
---
```

Internal action links are adjusted automatically when `i18nRouting` is enabled.

## Footer And Edit Link {#footer-edit-link}

The edit link appears at the bottom of article pages. `:path` is replaced with the current page relative path.

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  siteConfig: {
    lastUpdated: true,
  },
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/acme/project/edit/main/docs/:path',
      text: 'Edit this page',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright (c) 2026 Acme.',
    },
  },
})
```

Set `nav: false` in page frontmatter to hide previous/next page navigation for that page.

## Page Layouts {#page-layouts}

Press provides these common layouts:

| Layout | Use case |
| --- | --- |
| `default` | Standard documentation page |
| `home` | Landing page with hero and features |
| `posts` | Post list page |
| `post` | Blog post detail page |
| `tags` | Tag archive page |
| `404` | Not found page |

Example archive pages:

```md [pages/posts/index.md]
---
title: Posts
layout: posts
---
```

```md [pages/tags/index.md]
---
title: Tags
layout: tags
---
```

## Styling {#styling}

Set the theme primary color through `themeConfig.colors.primary`:

```ts [valaxy.config.ts]
export default defineValaxyConfig<PressTheme.Config>({
  themeConfig: {
    colors: {
      primary: '#0078E7',
    },
  },
})
```

You can also override Press CSS variables in your own styles:

```scss [styles/index.scss]
:root {
  --pr-nav-height-mobile: 56px;
  --pr-nav-text: var(--va-c-text-1);
}
```

## Component Customization {#component-customization}

Like other Valaxy themes, Press components can be overridden by creating a component with the same name in your site. Common extension points include:

| Component | Purpose |
| --- | --- |
| `PressHomeHero.vue` | Home hero |
| `PressHomeFeatures.vue` | Home feature grid |
| `PressNavBar.vue` | Top navigation bar |
| `PressSidebar.vue` | Left sidebar |
| `PressDocFooter.vue` | Edit link and previous/next footer |
| `PressArticle.vue` | Documentation article wrapper |

For lower-level theme authoring details, see [Write A Theme](/themes/write).
