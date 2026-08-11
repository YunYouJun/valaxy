# valaxy-addon-feishu

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-feishu?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-feishu)

[English](https://valaxy.site/addons/official/feishu) | **简体中文**

> **实验性功能** — 插件及其 API 可能在后续版本中发生变化。

通过 [Content Loader](https://valaxy.site/zh/guide/third-party/cms) 将飞书或 Lark 文档接入 Valaxy。

插件会获取飞书文档并转换为 Markdown，使其自然进入 Valaxy 的路由、搜索和 RSS 流程。

## 准备工作

你需要创建一个飞书企业自建应用，并授予以下权限：

- `docx:document:readonly` — 读取文档内容
- `wiki:wiki:readonly` — 读取知识空间（使用 `spaceId` 时需要）
- `drive:drive:readonly` — 下载图片（使用 `downloadImages` 时需要）

请前往[飞书开放平台](https://open.feishu.cn/)创建应用。

## 安装

```bash
pnpm add valaxy-addon-feishu
```

## 配置

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'
import { addonFeishu } from 'valaxy-addon-feishu'

export default defineValaxyConfig({
  addons: [
    addonFeishu({
      // 必填：飞书应用凭证
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,

      // 方案 A：获取知识空间中的全部文档
      spaceId: 'your-wiki-space-id',

      // 方案 B：按 ID 获取指定文档
      // documents: ['doc-id-1', 'doc-id-2'],

      // 可选配置（这里展示默认值）
      // prefix: 'posts',
      // devPollInterval: 60000,
      // downloadImages: true,
      // imageDir: 'feishu-images',
    }),
  ],
})
```

> **安全提示：** 不要把 `appId` 和 `appSecret` 直接提交到仓库。请使用环境变量或 `.env` 文件，并把 `.env` 加入 `.gitignore`。

## 配置项

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `appId` | `string` | 必填 | 飞书应用 ID |
| `appSecret` | `string` | 必填 | 飞书应用密钥 |
| `spaceId` | `string` | — | 获取全部文档的知识空间 ID |
| `documents` | `string[]` | — | 需要获取的文档 ID |
| `prefix` | `string` | `'posts'` | `pages/` 下的路径前缀 |
| `devPollInterval` | `number` | `60000` | 开发模式轮询间隔，单位为毫秒 |
| `downloadImages` | `boolean` | `true` | 是否把图片下载到 `public/` |
| `imageDir` | `string` | `'feishu-images'` | `public/` 下的图片子目录 |

`spaceId` 与 `documents` 至少需要提供一个。

## 支持的区块类型

插件会把飞书文档区块转换为 Markdown：

| 区块类型 | 输出 |
| --- | --- |
| 文本 | 段落 |
| 1–6 级标题 | `#` 到 `######` |
| 7–9 级标题 | **粗体文本**（Markdown 最高为六级标题） |
| 无序列表 | `- item`，支持嵌套 |
| 有序列表 | `1. item`，支持嵌套 |
| 代码块 | 带语言信息的围栏代码块 |
| 引用 | `> text` |
| 待办 | `- [x]` / `- [ ]` |
| 分割线 | `---` |
| 图片 | `![](url)`，默认下载到本地 |
| 表格 | 标准 Markdown 表格 |
| 高亮块 | 带 Emoji 的引用块 |
| 公式 | `$...$` 行内公式 |

支持的行内格式包括：**粗体**、*斜体*、~~删除线~~、`行内代码` 与[链接](https://example.com)。

## 工作流程

1. 插件通过 `setup()` 注入 Content Loader。
2. Vite 启动前，Loader 使用应用凭证向飞书鉴权。
3. 从知识空间或指定文档 ID 获取内容。
4. 将文档区块转换为 Markdown。
5. 把图片下载到 `public/{imageDir}/` 并重写地址。
6. 将带 Frontmatter 的 Markdown 写入 `.valaxy/content/pages/{prefix}/`。
7. Valaxy 的文件路由自动加载生成的页面。

## 相关链接

- [Content Loader 文档](https://valaxy.site/zh/guide/third-party/cms)
- [飞书开放平台](https://open.feishu.cn/)
- [GitHub Issue #294](https://github.com/YunYouJun/valaxy/issues/294) — Content Loader 设计讨论
