# CLAUDE.md

This file provides guidance to Claude Code (https://claude.com/code) when working with code in this repository.

## Project Overview

Valaxy is a Next Generation Static Blog Framework built with Vue 3, Vite 5, and pnpm workspaces. It's a monorepo containing the core framework, themes, addons, documentation, and demo sites.

**Key Links:**
- Documentation: https://valaxy.site
- Demo: https://yun.valaxy.site

## Essential Commands

### Development

```bash
# Install dependencies (MUST use pnpm due to workspaces)
pnpm i

# Build the core packages (required before first run)
pnpm run build

# Full development mode (builds CLI + runs demo)
pnpm dev

# Two-terminal development (recommended for better visibility):
# Terminal 1 - Watch core valaxy & valaxy-theme-yun packages
pnpm dev:lib

# Terminal 2 - Run demo site
pnpm demo
# or run docs
pnpm docs:dev
```

### Building

```bash
# Build core packages (utils -> valaxy -> devtools)
pnpm run build

# Build all packages in workspace
pnpm run build:all

# Build specific package
pnpm run build:valaxy
pnpm run build:create-valaxy
pnpm run build:devtools

# Build demo site
pnpm run demo:build

# Build docs
pnpm run docs:build
```

### Testing

```bash
# Run unit tests with Vitest
pnpm test

# Run E2E tests with Playwright
pnpm e2e

# Run E2E with UI
pnpm e2e:ui

# View E2E test report
pnpm e2e:report
```

Unit tests are located in `test/**/*.test.ts` and use Vitest.
E2E tests are in `e2e/` and use Playwright (tests docs site at localhost:4859).

### Linting

```bash
# Lint JavaScript/TypeScript/Vue files
pnpm lint

# Lint and fix styles
pnpm stylelint

# Type check
pnpm typecheck
```

### Other Useful Commands

```bash
# Clean build artifacts
pnpm clean

# Link valaxy CLI globally for local testing
pnpm link:dev

# Test the create-valaxy scaffolding
pnpm ci

# Run devtools development server
pnpm devtools
```

## Architecture

### Monorepo Structure

```
valaxy/
├── packages/
│   ├── @valaxyjs/utils/      # Shared utilities
│   ├── create-valaxy/         # CLI scaffolding tool (pnpm create valaxy)
│   ├── devtools/              # Valaxy DevTools integration
│   ├── valaxy/                # Core framework ⭐
│   ├── valaxy-theme-yun/      # Default Yun theme
│   ├── valaxy-theme-press/    # Press theme (VitePress-like)
│   └── valaxy-addon-*/        # Addons (waline, algolia, lightgallery, etc.)
├── demo/                      # Demo sites for testing
│   ├── yun/                   # Main demo using theme-yun
│   └── custom/                # Custom theme demo
├── docs/                      # Documentation site (uses Valaxy itself)
├── e2e/                       # Playwright E2E tests
└── test/                      # Vitest unit tests
```

### Core Package Structure (`packages/valaxy/`)

The core is split into **Node** (build-time) and **Client** (runtime):

**Node Side (`packages/valaxy/node/`):**
- `cli/` - CLI commands (dev, build, new, clean, deploy, debug)
- `config/` - Configuration resolution (site.ts, valaxy.ts, theme.ts, addon.ts)
- `plugins/` - Vite plugin orchestration
  - `preset.ts` - Main plugin composition
  - `markdown/` - Markdown-it processing pipeline
  - `vueRouter.ts` - File-based routing via unplugin-vue-router
  - `valaxy.ts` - Virtual module generation
  - `unocss.ts` - UnoCSS configuration
- `modules/` - Built-in features (RSS, Fuse search)
- `utils/` - Helper functions

**Client Side (`packages/valaxy/client/`):**
- `main.ts` - Entry point
- `app/` - Runtime data management
- `modules/` - Client-side modules (components, pinia, mermaid, etc.)
- `setup/` - Application setup
- `composables/` - Vue composables
- `components/` - Core Vue components
- `layouts/` - Layout system

### Configuration Flow

1. **CLI Entry** (`bin/valaxy.mjs`) → resolves options from:
   - `site.config.ts` - Site metadata (title, author, etc.)
   - `valaxy.config.ts` - Framework config (theme, addons, features)
   - Theme's `valaxy.config.ts` (if exists)
   - Addon configs
2. **Config Merging** - Uses `defu` deep merge: Default → Theme → Addons → User (user wins)
3. **Vite Server/Build** - Created with merged plugins from all sources

### Key Patterns

**Roots System:**
File resolution follows priority order:
```
roots = [clientRoot, themeRoot, ...addonRoots, userRoot]
```
User content overrides theme overrides core.

**Virtual Modules:**
Generated at build time via Vite plugins:
- `#valaxy/config` - Resolved runtime configuration
- `#valaxy/styles` - Combined styles from all roots
- `virtual:generated-layouts` - Layout routes
- `virtual:valaxy-addons` - Addon registration

**Routing:**
- File-based via `unplugin-vue-router`
- `.vue` and `.md` files in `pages/` directory
- Frontmatter parsed from `.md` and merged into route meta
- Layouts auto-assigned by path patterns

**Markdown Processing:**
Uses `markdown-it` with custom plugins:
1. Extract frontmatter (gray-matter)
2. Custom plugins (highlight, code blocks, containers, links)
3. @mdit-vue plugins (headers, toc, title, sfc)
4. Third-party (attrs, emoji, footnote, katex, task-lists)
5. Output cached for route generation

**SSG (Static Site Generation):**
- Powered by `vite-ssg`
- Filters draft posts in production
- Supports pagination
- Generates sitemap and redirects

## Theme Development

Themes are self-contained npm packages that extend Valaxy.

**Theme Structure:**
```
valaxy-theme-{name}/
├── client/           # Client-side code
├── node/             # Node-side config
├── components/       # Vue components (auto-imported)
├── layouts/          # Vue layouts
├── styles/           # Theme styles
├── locales/          # i18n files
├── App.vue           # Theme app entry
├── valaxy.config.ts  # Theme config (defineTheme)
└── index.ts          # Package exports
```

Themes can:
- Export `vite` config extensions
- Export `unocss` safelists/presets
- Define `themeConfig` schema
- Override any core components/layouts

Reference: [valaxy-theme-starter](https://github.com/YunYouJun/valaxy-theme-starter)

## Addon Development

Addons are pluggable packages for additional features.

**Addon Structure:**
```
valaxy-addon-{name}/
├── client/           # Vue components/stores
├── node/             # Node-side setup
├── components/       # Vue components (auto-imported)
├── valaxy.config.ts  # defineAddon export
└── index.ts          # Package entry
```

Addons can:
- Provide auto-imported Vue components
- Extend Vite config
- Hook into lifecycle events
- Register CLI commands

## Important Notes

### Package Manager
**MUST use pnpm** - the project uses pnpm workspaces. `npm` and `yarn` will not work correctly.

### Build Order
Core packages must be built before running demos:
```bash
pnpm run build  # Builds in order: utils → valaxy → devtools
```

### Repository URL Normalization
When displaying repository URLs from package.json, always import and use the `normalizeRepositoryUrl()` helper from `@valaxyjs/utils` to remove the "git+" prefix:
```ts
import { normalizeRepositoryUrl } from '@valaxyjs/utils'

const repoUrl = normalizeRepositoryUrl(pkg.repository.url)
```
This prevents browser errors with `git+https://...` URLs.

### Hot Reload
The dev server supports hot reload for:
- Config files (`valaxy.config.ts`, `site.config.ts`)
- Markdown files
- Vue components
- Styles

### Node Version
Requires Node.js 18+ or 20+

## Testing Strategy

- **Unit tests**: Test utilities, markdown processing, config resolution
- **E2E tests**: Test the built docs site and demo in real browsers
- Tests run in CI via GitHub Actions

## Deployment

The project supports:
- Netlify (via `netlify.toml`)
- GitHub Pages (via `.github/workflows/gh-pages.yml`)
- Other static hosts (build output in `dist/`)

## Release Process

```bash
pnpm release  # Uses bumpp to version and release
```

Releases are automated via `.github/workflows/release.yml`
