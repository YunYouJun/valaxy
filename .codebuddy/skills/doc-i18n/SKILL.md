---
name: doc-i18n
description: "Bilingual documentation translation and synchronization for path-based i18n projects. This skill should be used when users need to translate, compare, or synchronize documentation between Chinese and English versions. Triggers include requests to translate docs, sync i18n, compare zh/en docs, translate this page, check translation coverage, or any task involving bilingual Markdown documentation alignment. Supports both zh-to-en and en-to-zh translation directions."
---

# doc-i18n: Bilingual Documentation Translation Skill

## Purpose

Translate, compare, and synchronize bilingual (Chinese / English) Markdown documentation in path-based i18n projects. Ensure structural alignment, content consistency, and adherence to project-specific conventions.

## When to Use

- Translating a documentation file from one language to another
- Comparing two language versions for content drift or missing sections
- Checking translation coverage across the documentation tree
- Fixing heading IDs, internal links, or container syntax after translation
- Creating a new translation file from an existing source

## Workflow

### Phase 1: Analyze

Before making any changes, analyze the task:

1. **Identify the source and target files.** Determine the translation direction:
   - English to Chinese: `docs/pages/{path}.md` to `docs/pages/zh/{path}.md`
   - Chinese to English: `docs/pages/zh/{path}.md` to `docs/pages/{path}.md`

2. **Read both files** (source and target). If the target file does not exist, note that a new file must be created.

3. **Generate a diff report** listing:
   - Headings present in source but missing/untranslated in target
   - Paragraphs or sections with untranslated content (e.g., Chinese text in the English file)
   - Structural differences (extra/missing sections, reordered content)
   - Code blocks or examples that differ
   - Internal link path issues (see Link Rules below)
   - Heading ID mismatches (see Heading ID Rules below)

4. **Present the report** to the user before proceeding. If the task is a full translation, proceed directly after the report.

### Phase 2: Translate

Apply translations following these rules:

#### Content Rules

- **Translate prose, keep code.** Translate all natural language (paragraphs, tips, blockquotes, list items, headings). Keep code blocks, inline code, file paths, CLI commands, component names, and API identifiers unchanged.
- **Translate code comments.** Comments inside code blocks should be translated to match the target language.
- **Preserve Markdown structure exactly.** Keep the same heading hierarchy, list nesting, blockquote depth, container syntax, and blank line patterns.
- **Frontmatter.** Only translate the `title` field. Keep all other frontmatter fields (categories, tags, layout, etc.) identical.
- **Tone.** For Chinese: use concise technical Chinese (技术文档风格). For English: use clear, direct technical English.

#### Container Syntax

Use exactly **3 colons** for container directives:

```md
::: tip
Content here.
:::

::: warning
Content here.
:::

::: details Title
Content here.
:::
```

Never use 4 or 5 colons. When the project convention differs, read `references/conventions.md` for project-specific overrides.

#### Heading ID Rules

All headings with explicit IDs (`{#slug}`) must use **English slugs** in both language versions for cross-language anchor consistency.

For **English files**: headings auto-generate English slugs, so explicit IDs are optional:
```md
## Getting Started
```

For **Chinese files**: headings must include explicit English IDs:
```md
## 起步 {#getting-started}
```

**Slug format**: lowercase, hyphens for spaces, strip possessives, e.g.:
- `Get User's Valaxy Config` → `{#get-users-valaxy-config}`
- `Previous/Next Post` → `{#previous-next-post}`
- `Table of Contents` → `{#table-of-contents}`

#### Link Rules

Internal documentation links must use the correct path prefix:

- **English docs** (`docs/pages/{path}.md`): links without prefix, e.g., `/guide/getting-started`
- **Chinese docs** (`docs/pages/zh/{path}.md`): links with `/zh/` prefix, e.g., `/zh/guide/getting-started`
- **Anchor links**: always use English slugs, e.g., `[全局状态管理](#global-state-management)`
- **External links**: keep unchanged

#### Code Block Labels

Preserve file path labels in code blocks:
```md
```ts [site.config.ts]
// code here
```　
```

### Phase 3: Verify

After translation, run verification:

1. **Heading count check**: both files should have the same number of headings at each level
2. **Heading ID alignment**: all `{#id}` slugs in the Chinese file must match the auto-generated slugs in the English file
3. **Link check**: verify internal links use correct path prefixes
4. **Container syntax check**: verify all containers use 3 colons
5. **No mixed language**: verify the target file doesn't contain untranslated source-language text (except in code blocks and proper nouns)
6. **Frontmatter check**: verify frontmatter structure matches (only `title` differs)

Report any remaining issues to the user.

## Translation Coverage Check

When asked to check translation coverage across the documentation:

1. List all `.md` files under `docs/pages/` (excluding `docs/pages/zh/`)
2. For each file, check if a corresponding file exists under `docs/pages/zh/`
3. Report:
   - ✅ Files with both versions
   - ❌ Files missing Chinese translation
   - Files with significant size differences (more than 50% difference suggests incomplete translation)

## Reference Files

- `references/conventions.md` — Project-specific formatting conventions and overrides. Read this file when working on any project for the first time to understand project-specific rules.
