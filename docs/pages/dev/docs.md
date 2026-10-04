---
title: Participate in Docs
categories:
  - dev
end: false
---

## Documentation Guidelines

We welcome contributions to Valaxy's documentation, translations, and blog.

### Where to publish

- **[Project updates](/ecosystem/news)**: Dated summaries of major releases and ecosystem milestones, newest first. Link to the relevant article or documentation for details. Routine patch changes belong in [GitHub Releases](https://github.com/YunYouJun/valaxy/releases).
- **[Blog](/posts/)**: Feature articles, design decisions, and development notes. Add articles under `docs/pages/posts/`, with Chinese counterparts under `docs/pages/zh/posts/`. Include a title, publication date, tags, and a short introduction before `<!-- more -->`.
- **[Release showcase](/release/)**: The visual introduction to a major version. Link to it from project updates instead of duplicating its content.
- **Guides and [migration documentation](/migration/version)**: Maintain current usage instructions and upgrade steps here. Blog posts can explain the context and link to these instructions.

Keep the existing `/ecosystem/news` and `/posts/` URLs when updating navigation labels. Historical articles retain their original publication dates; add a dated note when their advice no longer applies.

## Documentation Organization

Valaxy documentation uses a **path-based separation** approach for organizing content in different languages:

- English documentation is located in `/docs/pages/`
- Chinese documentation is located in `/docs/pages/zh/`

For example:
```
docs/pages/guide/getting-started.md    # English version
docs/pages/zh/guide/getting-started.md # Chinese version
```

### Bilingual Container Approach (for specific scenarios)

Some documents (such as blog posts) may use bilingual containers to write content in both languages within the same file:

```md
::: zh-CN
Chinese content
:::

::: en
English content
:::
```

For more details, see [Single Page i18n](https://valaxy.site/guide/i18n) and [i18n Container Syntax](/guide/i18n#container-syntax).

## How to Translate

### 1. Create the Corresponding Chinese Document

If you find an English document that doesn't have a Chinese version yet, create the corresponding file under `/docs/pages/zh/`.

For example, to translate `/docs/pages/guide/ssr-compat.md`:

1. Create `/docs/pages/zh/guide/ssr-compat.md`
2. Copy the structure from the English document
3. Translate the content to Chinese
4. Keep code examples unchanged (unless comments need localization)

### 2. Keep Document Structure Consistent

- **Frontmatter**: Keep the same `categories`, `top`, etc. fields, only translate `title`
- **Heading Hierarchy**: Maintain the same heading structure as the English version
- **Code Examples**: Usually no translation needed, keep as-is
- **Links**: Internal links in Chinese docs should point to Chinese versions (e.g., `/zh/guide/...`)

### 3. Translation Tips

- Technical terms can include English on first use, e.g., "SSR (Server-Side Rendering)"
- Maintain technical accuracy, refer to [Vue documentation](https://vuejs.org/) translation standards
- Comments in code can be localized, but keep variable and function names in English

## How to Submit

Use GitHub Pull Requests to submit to valaxy.
It's recommended to submit a complete markdown file or a category translation as one commit.

Commit messages should start with `docs:`.

Examples:

- Adding new Chinese translation: `docs: add zh translation for ssr-compat`
- Updating existing translation: `docs: update guide translation`
- Fixing typos: `docs: fix typo in xxx.md`
- Updating English docs: `docs(en): update getting-started guide`

## Documentation Preview

Before submitting, preview the documentation locally:

```bash
# Install dependencies
pnpm install

# Start documentation dev server
pnpm docs:dev

# Build documentation (to check for build errors)
pnpm docs:build
```

Visit `http://localhost:4859` to view the documentation, and use the language toggle button in the top right to test language switching.
