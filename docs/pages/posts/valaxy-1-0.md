---
title: 'Valaxy 1.0: from writing experience to build internals'
description: Explore the writing tools, unified rendering pipeline, addon boundaries, and upgrade considerations in Valaxy 1.0.
date: 2026-10-04
categories:
  - releases
tags:
  - valaxy
  - ssg
  - devtools
end: true
---

Valaxy 1.0 is here. You can still start with a Markdown post, add a Vue component when you need interaction, and publish the site as static files. This release connects writing, management, rendering, and extensions more closely: everyday maintenance has more complete tools, builds follow one rendering path, and features such as diagrams and music are installed as needed.

This article explains what those changes mean for blog authors, theme developers, and addon authors.

<!-- more -->

::: info Version scope
This article covers **Valaxy 1.0.0 stable**, reviewed on **2026-10-04**. The [migration guide](/migration/version) maintains upgrade instructions; [GitHub Releases](https://github.com/YunYouJun/valaxy/releases) records subsequent patches.
:::

## Start with a post {#writing}

Valaxy keeps content in project files. A post can use Markdown for text, images, and code, and reference Vue components directly. When an article needs an interactive example, calculator, or custom card, you can maintain the component alongside the post and preview both in the development server.

Content and presentation have their own configuration. `site.config.ts` describes the site, while `valaxy.config.ts` configures the theme, addons, and framework behavior. Themes handle layout and appearance. Yun focuses on personal blogs; Press provides documentation navigation, sidebars, and content organization. This website's documentation and blog share one Press site.

The workflow can grow with your content: finish a post, then add components, choose a theme, or enable an addon as needed. Markdown, images, and Git history remain part of the project. See [Posts](/guide/post) and [Vue in Markdown](/guide/markdown#using-vue-in-markdown).

## Visual tools for everyday maintenance {#devtools}

During development, Valaxy DevTools brings post, configuration, and addon management into Vite DevTools. You can browse articles, edit metadata, organize categories and tags, and save changes back to project files. Page debugging exposes the current route and frontmatter, helping answer questions such as why a page uses a particular layout.

Addon management distinguishes browsing, installing a dependency, and enabling it in configuration. After installation, follow the addon's setup instructions. Review the preview before package or configuration changes so you can see which files an action affects.

DevTools runs with the development server and is excluded from production builds. Authors who prefer their editor can use the [VS Code extension](/ecosystem/vscode); desktop authors can explore the [Yunzhan public preview](/ecosystem/client). These tools work with project content. Their individual documentation describes supported workflows.

## One build and rendering implementation {#build}

The build foundation in 1.0 is **Vite 8 and Rolldown**. Hot updates still let you preview changes to posts, components, and configuration. For publication, the build produces browser assets and uses Vue SSR to generate static pages.

The legacy JSDOM-based `vite-ssg` engine has been removed. Valaxy now uses its built-in SSG engine, combining Vue SSR with string processing. Builds no longer provide `window`, `document`, or `navigator` through a simulated DOM. Themes and addons must run browser-dependent operations on the client; a successful development preview alone does not establish static-build compatibility.

Initial styling has changed too. Critical CSS inlining has been removed, and a **FOUC guard** coordinates initial visibility with stylesheet readiness. SSG produces HTML while CSS loads from build assets. Using SSG does not imply that every style is inlined or that CSS makes no additional requests. See [SSR compatibility](/guide/ssr-compat) for browser-only components and hydration.

Custom build configuration also needs attention. Historical Rollup `manualChunks` examples do not describe the current framework implementation: Valaxy uses Rolldown's `codeSplitting` configuration. Build duration and output size depend on content, themes, addons, hardware, and cache state. Measure them on your own site.

## Async rendering across content outputs {#markdown}

A post appears in several places. Its page displays the body, a list shows an excerpt, search extracts searchable text, and RSS distributes content to subscribers. Each path processes Markdown and must correctly await asynchronous steps such as code highlighting.

Valaxy 1.0 gives these paths shared async rendering semantics. Shiki loads languages asynchronously when needed, and callers with the same configuration can reuse a highlighter. Addon authors can work with one rendering contract, reducing the risk that an output path still assumes synchronous rendering.

Shared semantics do not make every output identical. Excerpts select content, search extracts text, and feeds handle links. Browser interactions cannot simply become interactive RSS content. When extending Markdown, check the page, excerpt, and other outputs your site uses. See the [Markdown guide](/guide/markdown) for supported syntax.

## Responsibilities across core, themes, and addons {#addons}

In 1.0, Mermaid diagrams and the Meting music player are provided by dedicated addons. Sites that need them install and enable the corresponding addon, then migrate existing configuration as documented. Mermaid Markdown fences remain usable; the legacy music-player switch needs migration.

For authors, enabling a feature now includes its addon installation and configuration. For maintainers, diagrams and music integrations have their own dependencies and release locations, with a defined feature scope. Bundle impact, third-party scripts, and service requirements still depend on the individual addon.

Other extensions include comments, search, galleries, and the [Moments timeline](/addons/official/moments) for short posts. Browse [official addons](/addons/official/) for setup instructions.

## AI tools can inspect the framework's view of a post {#ai}

An AI coding assistant can already edit Markdown files. Valaxy adds access to the framework's resolved view: the final route, selected layout, draft status, and potential local-link problems. Configuration and hooks can affect those values, so reading a source file alone may not answer these questions.

The local MCP service is disabled by default. When enabled, it exposes **read-only** tools for querying, reading, and checking content. It does not create or edit posts through MCP or expose management operations. DevTools editing and MCP are configured independently; the production site includes no local MCP service.

You can also inspect a post without connecting MCP. From the blog directory, run:

```bash
pnpm exec valaxy inspect --file pages/posts/hello.md --json
pnpm exec valaxy check --file pages/posts/hello.md --json
```

Replace the path with your own post. These commands help authors and coding assistants verify resolved content after an edit. A full build still validates the publishing pipeline. See [Work with AI](/guide/work-with-ai) for connection details and content visibility.

## Upgrade according to the features you use {#upgrade}

Before upgrading, save your project and lockfile, and ensure that local and deployment environments use **Node.js 22.12.0 or later**. Then review the parts that apply to your site:

| Usage | What to check |
| --- | --- |
| Standard writing and theme features | Update Valaxy and the theme; check posts, navigation, and a static build |
| Mermaid or music playback | Install the corresponding addons and migrate configuration |
| Custom SSG options | Remove `--ssg-engine` and `build.ssg.engine`; review supported SSG options |
| Theme or addon development | Check browser globals, SSR, hydration, current types, and virtual-module entry points |
| Historical build-optimization snippets | Reassess them against Vite 8 / Rolldown and measure the resulting assets |

Theme developers should check a production build, including direct route access, mobile layouts, overlays, and interactive components. Configuration alone cannot establish their runtime behavior.

Use the [complete migration guide](/migration/version#v1-0-0) for individual steps. If you are new to Valaxy, follow [Getting Started](/guide/getting-started), or explore the [1.0 release showcase](/release/) to see how Markdown, themes, and DevTools work together.
