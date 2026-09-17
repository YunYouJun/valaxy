# valaxy-addon-algolia

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-algolia?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-algolia)

[English](https://valaxy.site/addons/official/algolia) | **简体中文**

为 [Valaxy](https://valaxy.site) 站点接入 [Algolia DocSearch](https://docsearch.algolia.com/)。

> [!NOTE]
> 插件目前仅支持 DocSearch。Algolia 通常只接受技术文档站点的 DocSearch 申请。

## 安装

```bash
pnpm add -D valaxy-addon-algolia
```

## 使用

在 `valaxy.config.ts` 中配置插件：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonAlgolia } from 'valaxy-addon-algolia'

export default defineValaxyConfig({
  addons: [
    addonAlgolia({
      appId: '',
      apiKey: '',
      indexName: '',
    }),
  ],
})
```

## DocSearch 5 与 Ask AI

Ask AI 按需启用。未配置 `askAi` 时，Valaxy 加载纯关键词搜索入口；配置已发布的 Agent Studio agent 后，插件搜索框（包括 Yun）和 Press 会加载支持 AI 的入口：

```ts
addonAlgolia({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_ONLY_API_KEY',
  indexName: 'YOUR_INDEX_NAME',
  askAi: {
    agentId: 'YOUR_PUBLISHED_AGENT_ID',
    // 仅 Press 支持：在侧边面板中打开 AI 对话。
    sidePanel: true,
  },
})
```

也可使用 `askAi: 'YOUR_PUBLISHED_AGENT_ID'` 简写来启用 AI 弹窗。省略 `askAi` 即保持关闭。不要在站点配置中填写 Algolia 管理密钥或 LLM 服务商的私密密钥。

### 从 DocSearch 4 迁移

DocSearch 5 仅支持 Agent Studio。旧 Ask AI 的 assistant ID **不是** Agent Studio 的 agent ID，仅重命名字段不能完成后台迁移。

1. 在 Algolia 后台打开对应应用的 Ask AI assistant，选择 **Migrate to Agent Studio**。若此前从未启用 Ask AI，则没有需要迁移的 assistant；可以在 Agent Studio 新建 agent，或继续使用关键词搜索。
2. 检查 agent 的提示词、模型和搜索索引，随后发布。启用前确认 Agent Studio 条款、LLM 配置及用量费用。
3. 复制新发布的 agent ID，将 `askAi.assistantId` 替换为 `askAi.agentId`。使用字符串简写时，也需要将旧 ID 替换为新 ID。
4. 关键词搜索仍使用原有 `indexName` 和 `searchParameters`，Valaxy 会转换成 DocSearch 5 的 `indices` 格式。AI 可通过 `askAi.indices` 指定索引，并通过 `askAi.searchParameters` 按索引设置查询参数，例如 `{ docs: { filters: 'lang:zh-CN' } }`。AI 筛选使用 `filters`，不支持 `facetFilters`。
5. 在站点验证一次真实 AI 回答。仅能打开搜索弹窗并不能证明 agent 已发布或 API key 权限正确。

缺少 `agentId` 的旧对象配置会回退到关键词搜索，并输出控制台提示。详见 [官方 Agent Studio 迁移指南](https://docsearch.algolia.com/docs/agent-studio/migrate-to-agent-studio/)。
