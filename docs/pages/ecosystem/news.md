---
title: Project Updates
description: Major Valaxy releases and updates from its writing tools and addon ecosystem.
categories:
  - ecosystem
---

Major releases and ecosystem updates appear here. Read the [blog](/posts/) for feature articles and development notes, follow the [migration guide](/migration/version) when upgrading, and visit [GitHub Releases](https://github.com/YunYouJun/valaxy/releases) for complete version histories.

## 2026-10-04 · Valaxy 1.0 is released {#valaxy-1-0}

Valaxy 1.0 is the first stable release, building on Markdown writing, Vue components, and static publishing.

- **Build and rendering**: Vite 8 and Rolldown power the build, with one built-in SSG engine. Pages, excerpts, search, and RSS share async Markdown rendering.
- **Visual management**: DevTools provides article, configuration, and addon management. An optional local MCP content service supports editing with AI tools.
- **Optional addons**: Mermaid diagrams and the Meting music player are provided by dedicated addons that sites can enable as needed.

Before upgrading, ensure that your Node.js version is **22.12.0 or later** and review the configuration and addon changes in the migration guide.

[Explore Valaxy 1.0](/release/) · [Migration guide](/migration/version#v1-0-0) · [1.0.0 release notes](https://github.com/YunYouJun/valaxy/releases/tag/v1.0.0)

## 2026-10-04 · Writing tools and addon roundup {#ecosystem-roundup}

This roundup highlights tools for editing posts and extending a blog:

- **[Yunzhan client](/ecosystem/client)**: Yunzhan now carries forward the Valaxy writing client, with a Web editor and a public desktop preview. See the client page for supported platforms and available features.
- **[VS Code extension](/ecosystem/vscode)**: Version 0.1.0 provides a post list, multi-root workspace support, and local site previews. Install it from Marketplace or GitHub Releases.
- **[Moments addon](/addons/official/moments)**: Write short updates in Markdown and display them in a timeline with support for likes.
- **[Work with AI](/guide/work-with-ai)**: Learn how DevTools and the optional MCP content service work and how to enable them.

Browse [official addons](/addons/official/) for more extensions, or read the [blog and development notes](/posts/) for design decisions and technical articles.

## v0.15.x · Archive {#v0-15-x}

### Breaking changes {#break-changes}

Valaxy moved entirely to ESM in v0.15 and dropped CommonJS support.

[v0.15.0 release notes](https://github.com/YunYouJun/valaxy/releases/tag/v0.15.0)
