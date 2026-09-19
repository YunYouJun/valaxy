---
title: 与 AI 协作
categories:
  - guide
---

Valaxy 提供 Agent Skills、主题提示词和可选的 AI 可读内容输出，帮助你使用 AI 开发站点、定制主题和阅读博客。各项能力可以按需使用：

| 能力 | 默认状态 | 使用方式 |
| --- | --- | --- |
| Agent Skills | 按需安装 | 为编程助手提供 Valaxy 开发知识 |
| 主题提示词 | 按需使用 | 生成主题开发提示词并复制到编程助手 |
| `llms.txt` 与 Markdown 输出 | 默认关闭 | 在 `site.config.ts` 中启用 `llms.enable` |
| DevTools 管理面板 | 开发模式默认启用 | 在浏览器中管理文章和配置 |
| MCP | 默认关闭 | 设置 `mcp: true`，连接内置的本地只读工具 |
| WebMCP | 关闭 | 内置面板暂不向浏览器 Agent 开放工具 |


## Agent Skills {#agent-skills}

::: tip

🧪 实验性：Valaxy Skills 目前为实验性功能，正在积极开发中，欢迎反馈。


:::


[Valaxy Skills](https://github.com/YunYouJun/valaxy/tree/main/skills) 是由 Valaxy 团队维护的 AI Agent Skills。

安装 Skill 后，当你使用 AI Agent 来辅助开发 Valaxy 站点时，它可以自动利用 Valaxy 提供的丰富功能集。

这些知识帮助 Agent 使用 Valaxy 的配置、主题、插件等功能。Skill 本身不会授予文件或网络访问权限；实际操作仍取决于你使用的 AI 工具及其权限设置。




### 安装 {#installation}

```bash
npx skills add YunYouJun/valaxy
```


### 使用 {#usage}


#### 使用 Agent 开发 Valaxy 站点 {#using-an-agent-to-develop-valaxy-sites}

示例提示词：

```txt
创建一个 Valaxy 博客站点：
- 使用 valaxy-theme-yun 主题
- 配置 Algolia 搜索
- 添加 Waline 评论插件
- 启用 llms.txt 输出
- 自定义导航与侧边栏
```

Agent 将自动引用 Valaxy Skills 中的知识来正确配置 `site.config.ts` 和 `valaxy.config.ts`，使用合适的 API（如 `defineSiteConfig`、`defineValaxyConfig`），并遵循 Valaxy 的最佳实践。

#### 使用 Agent 开发 Valaxy 主题 {#using-an-agent-to-develop-a-valaxy-theme}

使用 [AI 主题提示词生成器](/zh/themes/write#generate-a-theme-with-ai)描述主题，并将包含版本核对要求的实现清单复制到编程助手中。生成的提示词覆盖最小主题结构、配置、样式、组件约定和验证步骤，同时不会假定当前版本不存在的 API。




## MCP：默认关闭，按需接入 {#mcp}

### 当前支持范围 {#mcp-status}

Valaxy 内置基于 [Devframe](https://devfra.me/adapters/mcp) 的本地只读 MCP 服务，使用 Streamable HTTP 连接。开启后即可使用文章查询、全文搜索、Markdown 阅读和合集目录浏览，无需自行注册工具或额外安装 MCP 插件。

该服务仅在开发模式运行，与 DevTools 面板独立：`devtools: false` 不影响已开启的 MCP，`mcp: false` 也不影响面板。生产构建不包含 MCP 服务。WebMCP 仍保持关闭。

### 开启并连接 {#mcp-integration}

在 `valaxy.config.ts` 中配置：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  mcp: true,
})
```

运行或重启 `pnpm dev`，终端会显示 MCP 地址和客户端需要设置的 `Origin` 请求头。默认路径为 `<base>__valaxy_mcp`。例如，站点地址是 `http://localhost:4859/` 时，MCP 地址为 `http://localhost:4859/__valaxy_mcp`；使用 `/blog/` 作为 `base` 时，则为 `/blog/__valaxy_mcp`。

以 [Cursor 的 MCP 配置](https://cursor.com/docs/mcp)为例，在站点项目中添加 `.cursor/mcp.json`：

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

将端口和路径替换为终端实际显示的值；`Origin` 只包含协议、主机和端口，不包含 `base` 路径。其他支持 Streamable HTTP 和自定义请求头的本地客户端也可使用相同地址与请求头。连接期间保持开发服务器运行。

连接后检查是否出现以下六个工具，再尝试提示词：「列出我的博客文章，检查第一篇的最终路由、布局和本地链接，并根据诊断修复 Markdown。」

| 工具 | 用途 |
| --- | --- |
| `valaxy_list_posts` | 分页列出 `pages/posts/` 中的文章元数据，按源文件路径排序 |
| `valaxy_search_pages` | 在可访问页面的标题、描述和 Markdown 正文中进行文本搜索，返回摘要 |
| `valaxy_read_page` | 根据查询结果中的相对路径分段读取正文与选定元数据 |
| `valaxy_list_collections` | 按 `pages/collections/` 的一级目录列出合集目录和可访问页面数量 |
| `valaxy_inspect_page` | 查询配置与路由钩子处理后的路由、别名、预览路径、布局、选定元数据和草稿状态 |
| `valaxy_check_page` | 检查元数据、路由冲突、布局、本地 Markdown 链接与图片，返回问题代码、位置和修复建议 |

列表和搜索默认每页返回 20 项，最多 50 项；用返回的 `nextOffset` 继续查询。正文默认每次返回 10,000 个字符，最多 20,000 个字符。合集浏览以 Markdown 文件为准，不执行合集的 TypeScript 配置，也不包含纯外链条目。

### 让 AI 理解框架解析结果 {#mcp-inspection}

AI 可以直接修改 Markdown；MCP 的额外价值是让它查询 Valaxy 如何处理这些文件。例如，文章的路由可能被钩子改写，元数据可能来自站点默认值，链接目标可能仍是草稿。这些信息无法仅凭当前 Markdown 文件判断。

`valaxy_inspect_page` 和 `valaxy_check_page` 都接受 `path`，例如 `pages/posts/hello.md`。它们复用 Valaxy 的路由生成流程，包括站点默认 frontmatter、主题/插件钩子、`router.extendRoute` 和最终路由树钩子。每次请求重新扫描当前文件，编辑后即可再次检查。布局检查读取实际布局插件生成的注册表，支持布局名称规范化和排除配置。

返回的 `previewPath` 包含站点 `base`。`draft`、`hidden` 和 `includedInProductionRoutes` 分别表示草稿、隐藏状态，以及当前解析结果是否通过生产环境的草稿过滤；隐藏页仍可能生成页面。此查询基于当前开发配置，不包含运行时路由修改、动态 `definePage` 元数据或生产专用配置的差异。

检查结果包含 `ok`、`diagnostics` 和 `totalDiagnostics`，最多返回前 100 条诊断。元数据错误和路由冲突属于 error；无法确认的本地链接、图片、布局，以及指向草稿的链接属于 warning。标准 Markdown 链接和图片参与检查，外部 URL、页内锚点、Vue/HTML 动态资源和自定义解析器不在检查范围内。此检查不替代完整构建或浏览器预览。

这两个工具会运行项目已配置的 Markdown/路由钩子，和开发服务器一样依赖可信的项目代码，不执行文章中的 JavaScript frontmatter。它们遵循 MCP 的内容可见性设置；无法解析 frontmatter 的文件仍不可通过 MCP 读取，请用下面的本地 CLI 检查语法。

### CLI 与 Node API {#content-cli}

无需开启 MCP，也可以在站点目录执行相同检查：

```bash
pnpm exec valaxy inspect --file pages/posts/hello.md --json
pnpm exec valaxy check --file pages/posts/hello.md --json
```

也可以把站点目录作为参数，例如 `valaxy check ./blog --file pages/posts/hello.md`。`--file` 始终相对站点根目录；省略 `--json` 可阅读诊断文本。存在 error 或命令执行失败时，退出码为 1；只有 warning 时退出码为 0。本地 CLI 可以检查作者自己的草稿、隐藏页和受保护页，输出仍不包含密码或原始 frontmatter。

Node 集成使用同一服务，并在结束时释放资源：

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

已有 Valaxy Node 实例时可直接传入。使用外部内容加载器的集成应先完成内容加载；CLI 会自动完成这一步。API 默认供站点作者使用；面向受限客户端时传入 `{ publicOnly: true }`，如需开放草稿再传入 `includeDrafts: true`。

### 默认范围与草稿 {#mcp-defaults}

MCP 默认关闭，由站点作者决定是否允许本机 AI 客户端读取内容。开启后的工具均为只读，不提供创建文章、修改文件、执行命令或读取完整站点配置的接口。

默认排除草稿、隐藏页面，以及设置了 `password`、`encrypt` 或 `gallery_password` 的受保护页面。只读取 `pages/` 内不超过 1 MiB 的 Markdown 文件，返回选定元数据与正文，不返回原始 frontmatter。需要让 AI 协助阅读草稿时，可以显式开启：

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  mcp: {
    includeDrafts: true,
  },
})
```

`includeDrafts` 不会开放隐藏页或受保护页面。修改配置后重启开发服务器。

### 关闭与排查 {#mcp-troubleshooting}

- **关闭服务**：设置 `mcp: false` 并重启开发服务器，或直接停止服务器；客户端连接配置可一并移除。
- **连接失败**：确认开发服务器正在运行，且端口与 `base` 路径和终端显示一致。
- **返回 403**：检查客户端是否发送了上述 `Origin` 请求头。当前服务仅接受本机连接，不支持远程或云端 Agent 直接访问。
- **找不到文章**：检查草稿、隐藏和加密设置，以及文件位置与大小。无法读取或解析的文件会从列表和搜索中跳过。


## CLAUDE.md {#claudemd}


Valaxy 仓库内置了 [CLAUDE.md](https://github.com/YunYouJun/valaxy/blob/main/CLAUDE.md) 文件，用于为 [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) 等 AI 工具提供项目上下文。

该文件包含：

- 项目架构概览（Monorepo 结构、核心包结构）
- 常用命令（开发、构建、测试、Lint）
- 配置流程（Config Merging、Roots System、Virtual Modules）
- 主题与插件开发指南
- 测试策略与部署方式

如果你使用 Claude Code 或其他支持 `CLAUDE.md` 的 AI 工具来开发 Valaxy，它将自动读取该文件以获得更准确的上下文理解。




## llms.txt {#llmstxt}


Valaxy 内置了 [llms.txt](https://llmstxt.org/) 支持，可以为你的博客生成 AI 可读的纯文本内容，默认关闭。

这些输出随站点部署后可供访问，不会创建本地工具连接，也不会授予 Agent 修改文章或配置的权限。

在 `site.config.ts` 中启用：

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  llms: {
    enable: true,
  },
})
```

启用后，Valaxy 将自动生成：

- `/llms.txt` — 站点索引，包含所有文章的标题、描述和链接
- `/llms-full.txt` — 完整内容，包含所有文章的全文（可通过 `fullText: false` 关闭）
- `/posts/xxx.md` — 每篇文章的原始 Markdown 文件（可通过 `files: false` 关闭）

### 配置选项 {#configuration-options}

```ts
export default defineSiteConfig({
  llms: {
    enable: true,
    // 是否生成 llms-full.txt（默认 true）
    fullText: true,
    // 是否为每篇文章生成独立的 .md 文件（默认 true）
    files: true,
    // 自定义提示词（添加到 llms.txt 的引用块部分）
    prompt: '',
    // 要包含的文件 glob 模式（相对于 pages/ 目录，默认 ['posts/**/*.md']）
    include: ['posts/**/*.md'],
  },
})
```

### CLI 命令 {#cli-command}

你也可以单独生成 llms.txt 相关文件：

```bash
npx valaxy llms
```

## AI 主题开发 {#ai-theme-authoring}

除了配置博客，你还可以让编程助手实现自己的主题。安装专用 Skill：

```bash
pnpm dlx skills add YunYouJun/valaxy --skill valaxy-theme
```

在[主题提示词生成器](/zh/themes/write#generate-a-theme-with-ai) 中选择设计预设，或描述自己想要的页面。Skill 会引导助手从官方 starter 创建主题与 demo，核对当前版本 API，检查移动端与无障碍，并验证静态构建和主题打包。AK UI / Arknights 提供了一个完整的设计与实现示例。
