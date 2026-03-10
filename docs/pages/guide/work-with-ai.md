---
title: Work with AI
categories:
  - guide
---

## Agent Skills


::: tip


🧪 Experimental: Valaxy Skills are currently experimental and under active development, feedbacks are welcome.

:::


[Valaxy Skills](https://github.com/YunYouJun/valaxy/tree/main/skills) are AI Agent Skills maintained by the Valaxy team.

After installing the skill, when you use an AI Agent to assist with developing Valaxy sites, it can automatically leverage the rich feature set provided by Valaxy.

This allows the agent to accurately use Valaxy configurations, themes, addons, and more **without requiring an internet connection or additional permissions**.


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


Valaxy has built-in [llms.txt](https://llmstxt.org/) support to generate AI-readable plain text content for your blog.

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

