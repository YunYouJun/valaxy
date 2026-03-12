# valaxy-addon-feishu

> **Experimental** — This addon and its API may change in future releases.

Feishu/Lark CMS integration for Valaxy via [Content Loaders](https://valaxy.site/guide/third-party/cms).

Fetches documents from [Feishu](https://www.feishu.cn/) (Lark) and converts them to Markdown, integrating seamlessly with Valaxy's routing, search, and RSS pipelines.

## Prerequisites

You need a Feishu self-built app with the following permissions:

- `docx:document:readonly` — Read document content
- `wiki:wiki:readonly` — Read wiki space (if using `spaceId`)
- `drive:drive:readonly` — Download images (if using `downloadImages`)

Create an app at [Feishu Open Platform](https://open.feishu.cn/).

## Installation

```bash
pnpm add valaxy-addon-feishu
```

## Configuration

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonFeishu } from 'valaxy-addon-feishu'

export default defineValaxyConfig({
  addons: [
    addonFeishu({
      // Required: Feishu app credentials
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,

      // Option A: Fetch all docs from a wiki space
      spaceId: 'your-wiki-space-id',

      // Option B: Fetch specific documents by ID
      // documents: ['doc-id-1', 'doc-id-2'],

      // Optional settings (shown with defaults)
      // prefix: 'posts',        // Output path: pages/posts/xxx.md
      // devPollInterval: 60000, // Re-fetch every 60s in dev mode
      // downloadImages: true,   // Download images to public/
      // imageDir: 'feishu-images', // Image output directory
    }),
  ],
})
```

> **Security:** Never commit `appId` and `appSecret` directly. Use environment variables or `.env` files (add `.env` to `.gitignore`).

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `appId` | `string` | *required* | Feishu app ID |
| `appSecret` | `string` | *required* | Feishu app secret |
| `spaceId` | `string` | — | Wiki space ID to fetch all docs from |
| `documents` | `string[]` | — | Specific document IDs to fetch |
| `prefix` | `string` | `'posts'` | Path prefix under `pages/` |
| `devPollInterval` | `number` | `60000` | Dev mode polling interval (ms) |
| `downloadImages` | `boolean` | `true` | Download images to `public/` |
| `imageDir` | `string` | `'feishu-images'` | Subdirectory in `public/` for images |

You must provide at least one of `spaceId` or `documents`.

## Supported Block Types

The addon converts Feishu document blocks to Markdown:

| Block Type | Output |
| --- | --- |
| Text | Paragraph |
| Heading 1–6 | `#` through `######` |
| Heading 7–9 | **Bold text** (Markdown caps at h6) |
| Bullet list | `- item` (nested) |
| Ordered list | `1. item` (nested) |
| Code block | Fenced code block with language |
| Quote | `> text` |
| Todo | `- [x]` / `- [ ]` |
| Divider | `---` |
| Image | `![](url)` (downloaded locally by default) |
| Table | Standard `\|` table |
| Callout | Blockquote with emoji |
| Equation | `$...$` inline math |

Inline formatting: **bold**, *italic*, ~~strikethrough~~, `inline_code`, [links](url).

## How It Works

1. The addon injects a Content Loader via its `setup()` function
2. Before Vite starts, the loader authenticates with Feishu using app credentials
3. Documents are fetched (from wiki space and/or explicit IDs)
4. Each document's blocks are converted to Markdown
5. Images are downloaded to `public/{imageDir}/` and URLs are rewritten
6. Markdown files with frontmatter are written to `.valaxy/content/pages/{prefix}/`
7. Valaxy's file-based routing picks them up automatically

## Related

- [Content Loader documentation](https://valaxy.site/guide/third-party/cms)
- [Feishu Open Platform](https://open.feishu.cn/)
- [GitHub Issue #294](https://github.com/YunYouJun/valaxy/issues/294) — Content Loader design discussion
