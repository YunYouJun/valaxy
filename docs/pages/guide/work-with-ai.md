---
title: Work with AI
categories:
  - guide
---

Valaxy provides Agent Skills, theme prompts, and optional AI-readable content output to help you develop sites, customize themes, and read blog content with AI. Choose the capabilities you need:

| Capability | Default state | How to use it |
| --- | --- | --- |
| Agent Skills | Install on demand | Provide Valaxy development knowledge to a coding assistant |
| Theme prompts | Use on demand | Generate a theme prompt and copy it into a coding assistant |
| `llms.txt` and Markdown output | Disabled | Enable `llms.enable` in `site.config.ts` |
| DevTools management panel | Enabled during development | Manage posts and configuration in the browser |
| MCP | Disabled | Set `mcp: true` and connect to the built-in local read-only tools |
| WebMCP | Disabled | The built-in panel does not expose tools to browser agents |

## Agent Skills


::: tip


🧪 Experimental: Valaxy Skills are currently experimental and under active development, feedbacks are welcome.

:::


[Valaxy Skills](https://github.com/YunYouJun/valaxy/tree/main/skills) are AI Agent Skills maintained by the Valaxy team.

After installing the skill, when you use an AI Agent to assist with developing Valaxy sites, it can automatically leverage the rich feature set provided by Valaxy.

This knowledge helps the agent use Valaxy configurations, themes, addons, and more. Skills do not grant file or network access; actual operations depend on your AI tool and its permission settings.


### Installation


```bash
npx skills add YunYouJun/valaxy
```

### Usage


#### Using an Agent to Develop Valaxy Sites

Example prompt:

```txt
Create a Valaxy blog site with:
- valaxy-theme-yun theme
- Algolia search configuration
- Waline comment addon
- llms.txt output enabled
- Custom navigation and sidebar
```

The agent will automatically reference Valaxy Skills knowledge to correctly configure `site.config.ts` and `valaxy.config.ts`, use the appropriate APIs (such as `defineSiteConfig`, `defineValaxyConfig`), and follow Valaxy best practices.

#### Using an Agent to Develop a Valaxy Theme

Use the [AI theme prompt generator](/themes/write#generate-a-theme-with-ai) to describe a theme and copy a version-aware implementation checklist into your coding assistant. The generated prompt covers the minimum theme structure, configuration, styles, component conventions, and validation without assuming unsupported APIs.


## MCP: disabled by default, opt-in integration {#mcp}

### Current support {#mcp-status}

Valaxy includes a local read-only MCP server built on [Devframe](https://devfra.me/adapters/mcp), using Streamable HTTP. Once enabled, it provides post listings, full-text search, Markdown reading, and collection directory browsing without registering tools yourself or installing an additional MCP plugin.

The server runs only during development and is independent of the DevTools panel: `devtools: false` does not disable an enabled MCP server, and `mcp: false` does not disable the panel. Production builds do not include the MCP server. WebMCP remains disabled.

### Enable and connect {#mcp-integration}

Configure `valaxy.config.ts`:

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  mcp: true,
})
```

Start or restart `pnpm dev`. The terminal prints the MCP URL and the `Origin` header required by clients. The endpoint is `<base>__valaxy_mcp`. For a site at `http://localhost:4859/`, it is `http://localhost:4859/__valaxy_mcp`; with a `/blog/` base, the path becomes `/blog/__valaxy_mcp`.

For example, following [Cursor's MCP configuration](https://cursor.com/docs/mcp), add `.cursor/mcp.json` to your site project:

```json [.cursor/mcp.json]
{
  "mcpServers": {
    "valaxy": {
      "url": "http://localhost:4859/__valaxy_mcp",
      "headers": {
        "Origin": "http://localhost:4859"
      }
    }
  }
}
```

Replace the port and path with the values printed in your terminal. `Origin` contains only the scheme, host, and port, without the base path. Other local clients supporting Streamable HTTP and custom headers can use the same URL and header. Keep the development server running while connected.

Check that these six tools appear, then try: “List my blog posts, inspect the first post's resolved routes and layout, check its local links, and fix the Markdown using the diagnostics.”

| Tool | Purpose |
| --- | --- |
| `valaxy_list_posts` | Paginate post metadata under `pages/posts/`, sorted by source path |
| `valaxy_search_pages` | Search accessible page titles, descriptions, and Markdown bodies for literal text and return excerpts |
| `valaxy_read_page` | Read body segments and selected metadata using a relative path from query results |
| `valaxy_list_collections` | List first-level directories under `pages/collections/` with accessible page counts |
| `valaxy_inspect_page` | Inspect routes, aliases, preview paths, layouts, selected metadata and draft status after configuration and route hooks |
| `valaxy_check_page` | Check metadata, route collisions, layouts, local Markdown links and images; return diagnostic codes, locations and repair hints |

Lists and search return 20 items by default, up to 50 per request. Continue using the returned `nextOffset`. Reading returns 10,000 characters by default, up to 20,000 per request. Collection browsing uses Markdown files; it does not execute TypeScript collection configuration or include external link-only entries.

### Framework-aware inspection {#mcp-inspection}

AI can edit Markdown directly. MCP adds access to how Valaxy interprets that content: hooks may rewrite routes, metadata may come from site defaults, and a link may point to a draft. The current source file alone cannot answer these questions.

Both `valaxy_inspect_page` and `valaxy_check_page` accept `path`, such as `pages/posts/hello.md`. They share Valaxy's route generation pipeline, including default frontmatter, theme/addon hooks, `router.extendRoute`, and final route-tree hooks. Each request scans current files so edits are reflected immediately. Layout checks read the actual layout plugin registry, including normalized names and exclusions.

`previewPath` includes the site base. `draft`, `hidden`, and `includedInProductionRoutes` distinguish draft status, hidden status, and whether current resolved routes pass the production draft filter. Hidden pages may still be generated. Inspection uses the current development configuration; runtime router mutations, dynamic `definePage` metadata and production-specific configuration differences are outside its scope.

Check results include `ok`, `diagnostics`, and `totalDiagnostics`, returning at most the first 100 diagnostics. Invalid metadata and route collisions are errors. Unresolved local links, images and layouts, and links to draft routes are warnings. Checks cover standard Markdown links/images, excluding external URLs, fragment anchors, Vue/HTML dynamic assets and custom resolvers. They do not replace a full build or browser preview.

Inspection runs configured Markdown/route hooks and trusts project code, just like the development server. It never evaluates JavaScript frontmatter. Both tools enforce MCP visibility settings. Malformed frontmatter remains unavailable over MCP; use the local CLI below to diagnose its syntax.

### CLI and Node API {#content-cli}

Run the same checks from your site directory without enabling MCP:

```bash
pnpm exec valaxy inspect --file pages/posts/hello.md --json
pnpm exec valaxy check --file pages/posts/hello.md --json
```

You can pass a site directory, for example `valaxy check ./blog --file pages/posts/hello.md`. `--file` is always relative to the site root. Omit `--json` for readable diagnostics. Errors or command failures set exit code 1; warnings alone leave exit code 0. The local CLI can inspect the author's own drafts, hidden and protected pages, while still excluding passwords and raw frontmatter from its output.

Node integrations use the same service and release resources when finished:

```ts
import { createContentService, createValaxyNode, resolveOptions } from 'valaxy/node'

const node = createValaxyNode(await resolveOptions({ userRoot: process.cwd() }))
const content = createContentService(node)
try {
  const result = await content.checkPage('pages/posts/hello.md')
  console.log(result)
}
finally {
  await content.dispose()
}
```

You can pass an existing Valaxy Node instance. Integrations using external content loaders should load content first; the CLI handles this automatically. The API defaults to owner access. Pass `{ publicOnly: true }` for restricted clients, and `includeDrafts: true` only when draft access is intended.

### Default scope and drafts {#mcp-defaults}

MCP is disabled by default so site authors can choose whether local AI clients may read their content. All exposed tools are read-only; there are no tools for creating posts, modifying files, executing commands, or reading the complete site configuration.

Drafts, hidden pages, and pages protected with `password`, `encrypt`, or `gallery_password` are excluded by default. Only Markdown files up to 1 MiB inside `pages/` are readable. Responses contain selected metadata and the body, without raw frontmatter. To let AI read drafts, enable them explicitly:

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  mcp: {
    includeDrafts: true,
  },
})
```

`includeDrafts` does not expose hidden or protected pages. Restart the development server after changing the configuration.

### Disable and troubleshoot {#mcp-troubleshooting}

- **Disable the server**: set `mcp: false` and restart the development server, or stop the server entirely. You can also remove the client connection configuration.
- **Connection failure**: check that the development server is running and that the port and base path match the terminal output.
- **403 response**: verify that the client sends the `Origin` header shown above. The server accepts same-machine connections only; remote or cloud agents cannot connect directly.
- **Missing pages**: check draft, hidden, and encryption settings, along with file location and size. Unreadable or malformed files are skipped in listings and search.


## CLAUDE.md


The Valaxy repository includes a built-in [CLAUDE.md](https://github.com/YunYouJun/valaxy/blob/main/CLAUDE.md) file that provides project context for AI tools like [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview).

This file contains:

- Project architecture overview (monorepo structure, core package structure)
- Common commands (development, building, testing, linting)
- Configuration flow (Config Merging, Roots System, Virtual Modules)
- Theme and addon development guide
- Testing strategy and deployment methods

If you use Claude Code or other AI tools that support `CLAUDE.md` to develop Valaxy, it will automatically read this file for more accurate context understanding.


## llms.txt


Valaxy has built-in [llms.txt](https://llmstxt.org/) support to generate AI-readable plain text content for your blog. It is disabled by default.

These files become accessible when deployed with your site. They do not establish a local tool connection or grant agents permission to modify posts or configuration.

Enable it in `site.config.ts`:

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  llms: {
    enable: true,
  },
})
```

Once enabled, Valaxy will automatically generate:

- `/llms.txt` — Site index with titles, descriptions, and links for all posts
- `/llms-full.txt` — Full content with complete text of all posts (disable with `fullText: false`)
- `/posts/xxx.md` — Raw Markdown files for each post (disable with `files: false`)

### Configuration Options

```ts
export default defineSiteConfig({
  llms: {
    enable: true,
    // Whether to generate llms-full.txt (default: true)
    fullText: true,
    // Whether to generate individual .md files for each post (default: true)
    files: true,
    // Custom prompt text (added to the llms.txt blockquote section)
    prompt: '',
    // Glob patterns for files to include (relative to pages/, default: ['posts/**/*.md'])
    include: ['posts/**/*.md'],
  },
})
```

### CLI Command

You can also generate llms.txt files separately:

```bash
npx valaxy llms
```

## AI theme authoring {#ai-theme-authoring}

Build your own theme with a coding assistant and the dedicated Skill:

```bash
pnpm dlx skills add YunYouJun/valaxy --skill valaxy-theme
```

Choose a preset or describe your pages in the [theme prompt builder](/themes/write#generate-a-theme-with-ai). The Skill guides your assistant through the official starter, installed APIs, mobile and accessibility checks, static builds and package verification. AK UI / Arknights provides a complete design and implementation example.
