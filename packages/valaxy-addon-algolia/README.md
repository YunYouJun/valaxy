# valaxy-addon-algolia

[![NPM version](https://img.shields.io/npm/v/valaxy-addon-algolia?color=0078E7)](https://www.npmjs.com/package/valaxy-addon-algolia)

**English** | [简体中文](https://valaxy.site/zh/addons/official/algolia)

Add [Algolia DocSearch](https://docsearch.algolia.com/) to a [Valaxy](https://valaxy.site) site.

> [!NOTE]
> The addon currently supports DocSearch. Algolia generally approves DocSearch applications for technical documentation sites.

## Installation

```bash
pnpm add -D valaxy-addon-algolia
```

## Usage

Configure the addon in `valaxy.config.ts`:

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

## Ask AI with DocSearch 5

Ask AI is optional. Without `askAi`, Valaxy loads the keyword-only DocSearch entry. With a published Agent Studio agent, both the addon search box (including Yun) and Press load the AI-capable entry:

```ts
addonAlgolia({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_SEARCH_ONLY_API_KEY',
  indexName: 'YOUR_INDEX_NAME',
  askAi: {
    agentId: 'YOUR_PUBLISHED_AGENT_ID',
    // Press only: open AI conversations in a side panel.
    sidePanel: true,
  },
})
```

You can also use `askAi: 'YOUR_PUBLISHED_AGENT_ID'` for the modal. Omit `askAi` to keep AI disabled. Never put an Algolia admin key or an LLM provider secret in the site configuration.

### Migrate from DocSearch 4

DocSearch 5 uses Agent Studio exclusively. A legacy Ask AI assistant ID is **not** an Agent Studio agent ID; renaming the property alone does not migrate the backend.

1. In the Algolia dashboard, open the application's Ask AI assistant and choose **Migrate to Agent Studio**. If you never enabled Ask AI, there is no assistant to migrate: create an agent in Agent Studio instead, or continue using keyword search.
2. Review the agent's prompt, model and search indices, then publish it. Check the applicable Agent Studio terms, LLM configuration and usage charges before enabling it.
3. Copy the new published agent ID and replace `askAi.assistantId` with `askAi.agentId`. For string shorthand, replace the old ID with the new one as well.
4. Keep the existing keyword-search `indexName` and `searchParameters`; Valaxy converts them to DocSearch 5's `indices` format. For AI, `askAi.indices` optionally selects indices, and `askAi.searchParameters` takes per-index overrides such as `{ docs: { filters: 'lang:en' } }`. AI filters use `filters`, not `facetFilters`.
5. Verify an actual AI response on the site. Opening the search modal alone does not verify agent publishing or API-key permissions.

Legacy object configurations without `agentId` fall back to keyword search with a console warning. See the [official Agent Studio migration guide](https://docsearch.algolia.com/docs/agent-studio/migrate-to-agent-studio/).
