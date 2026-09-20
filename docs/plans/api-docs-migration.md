# API 文档并入主站迁移计划

状态：代码、产物和本地性能预算已完成复测，可进入预览发布流程。目标 CI、正式域名、外部索引及旧站退役仍需依照文末发布顺序验收；本地通过不等于生产迁移完成。

## 补充：主题文档与 Vue API 导航参考

- 官网维护框架、主题开发和 Starter 指南；独立主题的具体配置与升级说明在主题仓库维护。
- Starter 增加轻量 Press `docs/` 工作区，与 `theme/`、`demo/` 分开；提供初始化替换、文档命令、检查以及 demo 根路径 + docs 子路径的合并部署。
- Vue 的 [API 首页](https://vuejs.org/api/)由手写 Markdown 入口和 `ApiIndex.vue` 渲染，详情正文也是人工维护的 Markdown。借鉴其分组、即时过滤、类型/说明/示例/关联指南的信息结构，不复制 Vue 的 VitePress 构建配置。
- Valaxy `/api/` 提供面向使用者的分组入口，完整类型参考仍由 addon 生成；入口筛选应有标签、无结果提示、键盘可访问性和 SSR 可读链接。不能把生成类型签名当成足够的使用说明。
- UI 分工：Press 的 API 索引组件只接收分组链接数据并负责过滤展示；docs 提供中英文分组和入口；addon 负责生成完整参考与导航。语言选择继续复用 Press locale composable。

## 目标与已确认决策

将 `api.valaxy.site` 的 API 文档并入 `valaxy.site/api/`，通过新增的 `valaxy-addon-typedoc` 生成内容，使用 `valaxy-theme-press` 展示。主站统一构建、搜索与部署。遇到构建性能压力，先定位并优化生成、编译、索引与 SSG，不把重新拆站作为默认方案。

| 决策 | 已确认内容 |
| --- | --- |
| 收录范围 | 保留现有 `client`、`node`、`types` 三个入口及现有 private/protected/internal 排除规则；不同时精简 API |
| 版本 | 单版本，随主文档部署，并展示对应包版本和源码提交；不新增历史版本站点 |
| 正文语言 | API 正文共用 `/api/`，保留源码注释语言；中英文导航与介绍分别维护 |
| 开发更新 | 监听相关 TypeScript/TSDoc 变更，缓存、去抖、串行更新；普通文档修改不触发 TypeDoc |
| 失败策略 | 生产生成失败阻断构建；开发保留上次完整成功结果并明确报错 |
| 旧域名 | 长期保留 `api.valaxy.site`，作为逐页 HTTP 301 重定向入口；停止旧内容站构建 |
| 共用页语言切换 | 保留当前符号页、查询参数与锚点，仅切换导航等界面语言；正文不翻译 |

首版交付可独立安装的 addon 和 Press 集成。生成层保持普通 Markdown 与 Valaxy 内容接口，Press 不强制依赖 TypeDoc。其他主题可消费普通页面；首版不承诺提供所有主题的专用导航界面。

## 调查事实与范围限制

- 当前 `api/package.json` 通过 TypeDoc 生成 Markdown，再用 VitePress 构建；`typedoc-vitepress-theme` 负责现有导航输出。源配置为 `api/typedoc.json`。
- 本地存量快照有 278 个 API Markdown，约 280 KB；`docs/pages` 有 172 个 Markdown。它们只是调查时的本地产物，不是重新生成后的页面数或性能基线，不能据此推断构建耗时。
- 当前中英文 `/api` 页面依赖 `docs/components/api/ApiDocsRedirect.vue` 跳到旧站。旧站还包含两篇优化笔记，必须一并迁移。
- 现有 ContentLoader 将生成页写入 `.valaxy/content/pages`，路由已扫描该目录；搜索、原始 Markdown、`llms.txt`、死链检查和部分 HMR 仍有基于 `userRoot/pages` 的假设。
- Loader 目前只按内容 digest 跳过写文件，仍执行上游生成；生成失败会记录错误后继续。不能直接沿用其默认行为满足本次要求。
- SSG 已串行执行 client/server 两次 bundle，页面渲染默认并发 20；Markdown LRU 上限为 128，Shiki 已有共享实例缓存。是否需要调整，取决于实测。
- SSG 在堆限制不足约 4 GB 时会重新启动进程。现有设置 2 GB 的测试命令不能证明构建实际受 2 GB 限制，测量须覆盖父子进程。
- 仓库未发现旧 API 域名的完整托管/DNS 声明或 Algolia crawler 配置。必须在切换前查证实际环境；主站源码修改本身不会配置旧域名的 HTTP 重定向或触发外部重新索引。

## 目标架构与目录

```text
TypeScript / TSDoc / tsconfig
  → valaxy-addon-typedoc（输入缓存、生成、导航、错误处理）
  → ContentLoader（完整产物验证、内容清单、增量落盘）
  → .valaxy/content/pages/api/
  → Valaxy 路由、Markdown、搜索、llms、SSG
  → Press 正文、目录、侧边栏
  → valaxy.site/api/

api.valaxy.site/* → HTTP 301 → 对应主站页面
```

建议目录：

```text
packages/valaxy-addon-typedoc/
  index.ts                 # addon 工厂与公开类型
  node/                    # TypeDoc 适配、缓存、生成与监听
  types/                   # 配置类型
  README.md
  README.zh-CN.md
  package.json
docs/
  typedoc.json              # 迁移现有生成选项
  pages/api/index.md        # 英文介绍与模块入口
  pages/zh/api/index.md     # 中文介绍，链接共用正文
  pages/dev/notes/          # 迁入原有笔记，保留原文语言
```

介绍页与 TypeDoc 生成索引不能占用同一路径。主站保留手写 `/api/` 介绍与分类筛选页，使用 addon 的 `excludeIndex: true` 省略生成的根索引。没有手写入口时默认生成根索引。符号及模块页面保留 `/api/client/`、`/api/node/`、`/api/types/` 层级，旧根索引和返回根索引的链接指向 `/api/`。

公开配置保持小规模：入口、tsconfig/TypeDoc 选项文件、路由前缀、根索引位置与 Press 侧边栏接入。TypeDoc 高级选项复用上游配置，不复制一份完整配置 API。缓存目录、去抖与产物整理优先作为实现细节；明确存在使用需求时再开放选项。

## 阶段 0：建立基线与迁移清单

交付物：可复现的构建报告、旧 URL/锚点清单、迁移路径映射、托管与抓取配置调查结果。

1. 固定源码提交、Node/pnpm 版本、依赖、机器和 CPU/RAM；重新生成当前 API，记录诊断、页面数和输出文件。现有错误单独记录，不用全局跳过检查掩盖问题。
2. 测量旧 docs、旧 API 的冷缓存和暖缓存构建。核心包构建独立计时，避免重复计入比较。
3. 记录 TypeDoc 分析与输出、页面发现、Markdown/Shiki、client/server bundle、页面 SSR、索引和 sitemap 的阶段耗时；记录总体墙钟、CPU、整个进程树峰值 RSS、缓存命中、页面数和产物大小。
4. 生成旧 API URL 清单，包括 `/`、`/typedoc/`、模块/符号页、`.html`、尾斜杠、笔记与 fragment；确认旧网站实际发布路径与本地生成输出的差异。
5. 查明旧域名所在托管项目、HTTP 重定向配置位置、现有部署回退能力；查明 Algolia 索引和 crawler 的路径、语言过滤与选择器配置。
6. 基线完成后锁定时间、内存预算和测量噪声容差，再进入最终性能比较。具体秒数与 GB 值当前没有测量依据，不提前声称已达标。

验收：基线可以复现；清楚区分“仓库已知事实”和“外部平台尚待核实的状态”。

## 阶段 1：补齐生成内容的通用能力

交付物：一个共享的页面来源解析模块，以及基于真实生成目录的回归测试。

1. 明确物理文件、所属内容根、逻辑页面路径、最终 URL 的映射；生成后刷新页面清单，使空缓存首次构建、新增、删除均可见。
2. 保持现有主题/用户覆盖行为兼容；新的生成页面与手写页面或其他 loader 冲突时给出可定位错误，不静默覆盖。主站根索引冲突通过前述独立路径消除。
3. 让 local search、Fuse、`llms.txt`/原始 Markdown 服务、死链检查和 HMR 共用来源解析。避免逐处拼接 `.valaxy` 特例。保留既有搜索可见性规则，不能让受保护或排除索引的内容因来源改变而被收录。
4. 消除将页面磁盘清单原位改成无扩展名 URL 清单的混用，保留现有对外类型与行为兼容。
5. 为 loader 增加可选择的严格错误策略，TypeDoc 启用；不全局改变其他 loader 的失败行为。
6. 生成到暂存区域，先验证页面和导航，再发布完整结果。处理转换失败、非法路径、重复路径、意外空输出、文件消失及中断，避免半套产物成为上次成功缓存。
7. 在生成内容发布后统一通知页面清单、导航虚拟模块与索引更新；新增本地文件监听能力须提供关闭时释放机制。

主要涉及：`node/options.ts`、`node/types/loader.ts`、`node/modules/content.ts`、`node/plugins/vueRouter.ts`、`node/plugins/markdown/transform/dead-links.ts`、`node/plugins/valaxy/index.ts`、`node/plugins/localSearchPlugin.ts`、`node/modules/fuse.ts`、`node/modules/utils.ts`、`node/modules/llms/`、`node/plugins/llms.ts`。

验收：从空 `.valaxy` 开始的小型 loader fixture 同时出现在路由、SSG、搜索和 Markdown/llms 输出中；新增、删除、失败恢复及多来源链接正确。

## 阶段 2：实现 valaxy-addon-typedoc

交付物：可安装 addon、使用文档、小型真实 TypeDoc fixture 与缓存/监听测试。

1. 通过 addon setup 注册 ContentLoader，复用 `typedoc` 与 `typedoc-plugin-markdown`。TypeDoc 的导入和执行只发生在 Node 侧且启用 addon 时。
2. 生成标准 Markdown、必要的 frontmatter 和导航数据。将 VitePress 专属主题替换为面向 Valaxy 的输出适配，保留当前符号页面结构与标题锚点的兼容性。
3. 优先使用上游导航数据/公开扩展点构建 Press 侧边栏；不按文件名猜测符号语义，不重写 TypeDoc 类型系统。先用 fixture 确认当前锁定版本的能力。
4. 对入口依赖图、相关源文件/声明文件、tsconfig 及其扩展、TypeDoc 选项、工具和插件版本建立缓存失效规则。依赖图信息不足时保守失效；不能用仅入口文件 mtime 判断有效性。
5. 一次构建只进行必要的一次类型分析；client/server 两次 bundle 复用结果。SSG 自动重启后也能验证并复用磁盘缓存。提交标识、源码链接与输出内容必须对应，避免缓存复用造成版本标注失真。
6. 开发监听源码和相关配置，去抖、串行执行；更新期间新增变更排队处理，不重叠生成，不监听自身产物形成循环。手写文档修改不触发 TypeDoc。
7. 成功后按内容增量写入并删除失效页面，同时更新导航和搜索。失败时保留整套上次成功产物、标记错误并保留恢复能力；没有成功缓存时明确显示不可用。
8. 生产遇到 TypeDoc/转换/输出校验错误非零退出。缓存输入完全匹配属于有效复用；输入已变后生成失败不能当作有效缓存发布。
9. 文档说明默认行为、配置相对路径、版本标识、刷新/清理方法和失败处理。使用 workspace 依赖进行主站接入，并验证打包后的 addon；公开发布沿用现有 addon 发布机制，发布执行属于上线阶段。

验收：fixture 包含泛型、重载、跨入口引用、命名空间与删除的符号；覆盖空缓存、命中、失效、失败恢复和无重复生成。确认客户端产物不包含 TypeDoc/TypeScript 编译器。

## 阶段 3：接入 Press 与主文档

交付物：`/api/` 正文与导航可用，中英文入口合理，两篇笔记迁移，站内引用全部更新。

1. 添加 docs 的 workspace addon 依赖，迁入 TypeDoc 配置，保留三个入口和现有排除规则。
2. 将英中文跳转页改成介绍页，移除 `ApiDocsRedirect.vue` 使用；共享模块和符号页仅生成一次。
3. 按 `/api/` 分区接入 Press 侧边栏，保留主站已有分区；导航数据生成后可用，开发重新生成后无需重启服务器。
4. 显示包版本和源码提交；预览/开发构建如包含未提交内容，不能伪装成精确对应某个正式版本。
5. 补齐 Press 共用页面行为：切换语言时保留当前详情页、查询参数和锚点，仅改变界面语言，正文、canonical 和索引 URL 保持唯一；侧栏与上一页/下一页链接继续指向共用路径。共用规则只覆盖生成的 API 页面，中英文介绍页继续遵循各自路由。
6. 语言选择约定：站内进入共用 API 时沿用当前语言；刷新时恢复已保存偏好；首次直接访问且无偏好时使用站点默认语言；回到普通文档时以其语言路径为准。静态 HTML 使用确定的默认语言，客户端偏好在挂载后应用，避免 SSR/hydration 不一致；该行为需有回归测试。
7. 将原 `api/notes` 两篇文章迁入 `docs/pages/dev/notes/`，保留文件名与既有锚点；更新主题开发文档中的引用，不要求此次补译文章。
8. API 页面关闭误导性的“编辑生成文件”入口；正文保留精确的源码链接。元数据避免使用每次生成时间冒充内容更新时间。
9. 检查 SSG 页面正文、标题层级、描述、canonical、sitemap；验证 local search 和 llms 的生成页收录。
10. 调整 Algolia 抓取范围和语言过滤，使中文用户也能搜索共用 API；测试结果指向主站新 URL。需要实际重新抓取后的验证，不能仅凭本地搜索通过宣称完成。

验收：`client`、`node`、`types` 代表性页面、长类型表格、目录、侧栏、跨页链接、语言切换和移动端布局通过浏览器检查；不存在 `/zh/api/<symbol>` 等意外死链。

## 阶段 4：性能测量与有依据的优化

原则：完整内容、正确链接与真实资源测量优先。不能通过漏生成 API、关闭链接检查、缩减收录范围或自动扩大堆上限来宣称性能优化完成。

| 场景 | 必测结果与目标 |
| --- | --- |
| 未启用 addon 的普通站点 | 不加载 TypeDoc、不扫描 API 源码；通用改动在基线噪声范围内无明显回归 |
| 合并站冷构建 | 完整生成 API；分阶段对比旧 docs + API 的总计算成本，同时单独记录主站部署等待时间 |
| 输入未变的暖构建/重启 | 验证缓存后跳过 TypeDoc 分析；不重写内容相同的生成页 |
| 修改普通文档 | TypeDoc 执行次数为 0；正常文档 HMR 行为保持 |
| 修改 TSDoc/导出/依赖类型 | 相关缓存失效，合并短时间变更且无重叠任务；页面/导航/索引同步更新 |
| 源码删除或改名 | 无过期路由、过期搜索结果或残留侧栏条目 |
| 内存压力 | 测整个进程树的峰值 RSS 和运行环境实际限制；显式记录是否发生自动重启 |

总体性能门槛在阶段 0 数据基础上确定：目标是合并后的总计算成本不高于原两站合计（考虑测量噪声），峰值内存适配实际 CI/托管预算，并保持普通文档开发体验。旧两站若并行部署，总计算成本不能代替关键路径时延；报告须分别列出。超出预算必须分析并优化后重新验收，不能默认以拆站解决。

优化顺序：

1. 消除重复 TypeDoc 分析、重复扫描和不必要的缓存失效。
2. 检查 Markdown/Shiki 实测命中率与内存，确认 LRU 是否在两轮 bundle 间发生抖动。已有 Shiki 缓存继续复用；如需调整容量或持久化，先验证缓存键和内存收益。
3. 按数据减少重复 Markdown 渲染和索引工作；生产索引全量生成一次，开发按受影响页面更新。
4. 若 SSR 成为瓶颈，再比较有限的并发配置，选择吞吐和 RSS 均合适的值。不要盲目并行 client/server bundle 增加峰值内存。
5. 确有重复编译收益时再引入更深层构建缓存；不要把迁移扩成整套构建系统重写。

仅在阶段 0 与最终版本做完整对比组；有新改动或瓶颈证据时补测相关场景，不无条件反复跑全部构建。每组冷/暖基线采用相同条件重复测量，建议 3 次并记录中位数与范围。

## 阶段 5：链接迁移、CI 与上线切换

建议映射（最终以旧 URL 清单和实际 clean URL 输出校正）：

| 旧地址 | 主站目标 |
| --- | --- |
| `https://api.valaxy.site/` | `https://valaxy.site/api/` |
| `https://api.valaxy.site/typedoc/` 及旧根索引变体 | `https://valaxy.site/api/` |
| `https://api.valaxy.site/typedoc/<module-or-symbol>` | `https://valaxy.site/api/<module-or-symbol>` |
| `https://api.valaxy.site/notes/` | `https://valaxy.site/dev/notes/` |
| `https://api.valaxy.site/notes/<slug>` | `https://valaxy.site/dev/notes/<slug>` |

1. 生成可审阅的逐页映射清单，并验证目标确实存在；不能把全部旧链接统一重定向到首页。处理 `.html`、index、尾斜杠、查询参数及大小写，避免链式重定向与循环。
2. 在原域名的实际托管/边缘服务配置 HTTP 301。Valaxy 的客户端跳转组件或 HTML 跳转不等同于 HTTP 301。
3. HTTP 请求不携带 fragment，服务端不能按旧 fragment 映射。优先保留旧锚点；若生成器改变 ID，为必要目标保留兼容锚点，用浏览器验证最终落点。
4. 将 CI 中独立 `api:build` 替换为 addon fixture、生成页回归与统一 docs 验证；与既有 Playwright docs 构建复用产物，避免同一任务重复生成。
5. 完成 addon 打包与适用检查、预览发布、完整链接扫描和性能对比，先部署主站新 API。
6. 验证正式主站内容与 sitemap，完成 Algolia 抓取及查询验证；随后切换旧域名 HTTP 301，并检查真实响应和浏览器锚点。
7. 切换稳定后移除旧 `api/` 内容项目、workspace 条目、旧构建脚本及仅供其使用的依赖/catalog 项；保存重定向清单和轻量域名托管配置。`api:*` 命令如保留过渡别名，必须明确转向统一文档任务。
8. VitePress 仍被 docs 的备用脚本和 Press 的样式/类型使用，不能因 API 迁移而全仓删除。

上线前准备回退：保留旧站最后一次可用产物、主站上一部署和完整重定向配置。先在预览环境验证映射，再启用永久重定向。301 可能被浏览器缓存，回退时主站 `/api/` 也必须继续可访问；不能依赖撤掉域名规则自动修复已缓存跳转。

## 验证矩阵与合并条件

| 层级 | 重点 |
| --- | --- |
| 内容基础 | 空缓存、多内容来源、冲突、路径规范、受保护内容、原子更新、失败恢复 |
| Addon | 真实 TypeDoc fixture、选项解析、输出导航、泛型/重载/跨模块链接、缓存失效和源码监听 |
| 搜索与 llms | 初次生成、新增/修改/删除、正确 URL 与锚点、Markdown 输出、语言过滤 |
| Press | 侧栏分区/高亮/更新、目录、共用页语言切换、返回普通文档、SSR/hydration |
| SSG 产物 | 实际 HTML 内容、全部内部 URL 和 fragment、canonical、sitemap、无旧生成页残留 |
| 性能 | 冷/暖构建、普通文档编辑、API 编辑、TypeDoc 调用次数、进程树峰值 RSS |
| 部署 | 旧域名真实 301、查询参数与锚点、无循环、Algolia 主站结果、回退演练 |

优先扩展现有 `test/content-loader.test.ts`、`test/local-search.test.ts`、`test/llms.test.ts`、`test/client/press-sidebar.test.ts` 及相关 locale/redirect 测试；新增一个小型 addon fixture 和 `e2e/docs` API 场景。最终 HTML fragment 检查需补充现有仅检查路径的死链检查。

执行适用的 pnpm 单元测试、lint/typecheck、核心包构建、统一 docs SSG 和 Playwright 检查。源码链路跨度较大，需要覆盖受影响模块；通过后仅因新改动、失败或明确未解疑点扩大或重复测试。

区分两个完成状态：

- **可合并代码**：基础能力、addon、主站接入与文档完成；干净构建、回归测试、打包和性能验收通过；重定向/外部抓取变更有明确可执行方案。
- **迁移完成**：正式新页面已发布，旧域名逐页 301 与 Algolia 查询实际验证通过，旧内容构建停止，清理与回退材料齐全。外部平台尚未切换时不能把迁移标记为完成。

## 实施顺序与提交拆分

建议按可独立审阅的变更推进，保持 Conventional Commits：

1. `test(docs): establish api migration fixtures and build baselines`
2. `fix(content): integrate generated pages across docs pipelines`
3. `feat(addon-typedoc): generate cached api documentation`
4. `feat(press): support shared documentation locale switching`
5. `feat(docs): integrate generated api reference`
6. `perf(docs): reduce measured api build overhead`（只提交实际测出并解决的问题）
7. `ci(docs): validate unified documentation builds`
8. `chore(docs): retire the standalone api content site`（完成正式切换后）

不要求每项单独 PR；基础修复、addon 和站点接入应分清审阅范围。性能门槛和链接兼容属于本次迁移交付；大范围公开 API 清理、多版本管理及其他主题专用 UI 留作独立需求。

## 实施记录（2026-09-21）

### 已落地的代码

- 新增 `valaxy-addon-typedoc`，接入主站三个入口、缓存、源码监听、独立生成进程、导航和源码版本标记。生成页不提交到 Git。
- 修复 ContentLoader 到路由、搜索、Markdown/llms、死链检查的数据流；严格校验路由冲突，批量发布失败恢复旧结果，删除过期页面。
- Press 增加分组过滤组件及共用正文语言切换；保留符号页、查询参数和锚点。API 页关闭生成文件编辑入口与误导性的更新时间，目录别名使用统一 canonical。
- 英中文 API 入口、两篇旧站笔记、addon 使用说明及 Starter 指南已迁入官网。CI 复用主站 SSG 产物并检查 API 链接。
- Starter 仓库新增独立 Press `docs/` 工作区及组合部署脚本，输出 `/` demo + `/docs/` 文档；初始化脚本、CI、Pages、安装/配置/定制指南同步更新。
- 浏览器验收发现并修复既有本地搜索的首次打开、索引重复解析和异步索引响应问题；补齐回归测试。Starter 暂时携带对应 Valaxy/Press 的 pnpm 补丁，避免依赖本机路径或未发布版本。
- Starter demo 日期组件显式使用站点时区，未配置时采用 UTC，修复组合预览暴露的 SSR/浏览器日期不一致；主题配置说明同步记录这一规则。

### 本地验证与兼容性

- 主仓库完成核心包构建、ESLint、Vue/TypeScript 检查、496 项单元测试及 8 项桌面/移动端 Playwright；具体命令为 `pnpm build`、`pnpm lint`、`pnpm exec vue-tsc --noEmit --skipLibCheck`、`pnpm exec vitest run`、`pnpm docs:build`、`pnpm e2e:ssg`。
- `pnpm verify:api` 验证 296 个 HTML 输出（包括目录别名）、4,527 条内部链接，以及旧站快照 291 页、2,163 个锚点；生成 600 条逐页 HTTP 301 规则。规则文件位于 `api/migration/dist/_redirects`，这不等于生产服务器已经返回 301。
- `pnpm validate:addons` 验证 19 个 addon、12 个中英文文档路由及仓库 URL；addon 打包确认包含 worker、链接转换和双语 README。
- Starter 完成 lint、初始化测试、demo/docs SSG、类型检查、组合产物与主题打包。验证组合预览的 `/docs/` 路径、搜索与桌面/移动端页面，不能仅用工作区构建代替浏览器检查。
- Addon 依赖本次新增的核心能力，发布要求 `valaxy >=1.0.0-rc.13 <2`。先发布包含这些变更的 Valaxy/Press，再发布 addon 并升级 Starter；版本号若调整，应同步更新 peer 范围。当前已发布的 rc.12 不能无补丁消费全部新能力。

### 首轮性能记录（已由下方复测更新）

环境为同一台 macOS、Node 24.18.0、pnpm，500ms 采样整个构建进程树 RSS。以下是单次样本，不是三次中位数；冷构建指 TypeDoc 缓存未命中，并非清空操作系统或 pnpm 缓存。

| 场景 | 耗时 | 进程树峰值 RSS |
| --- | ---: | ---: |
| 迁移前主站 | 24.36 s | 3,435 MiB |
| 迁移前独立 API | 15.96 s | 1,314 MiB |
| 首次合并构建 | 54.57 s | 3,714 MiB |
| 优化后冷构建 | 47.00 s | 4,273 MiB |
| 优化后暖构建 | 40.64 s | 4,242 MiB |

旧两站顺序构建耗时合计 40.32 s；如果原部署并行，关键路径约为主站的 24.36 s。上述单次耗时不代表严格的 CPU 计算成本。暖构建确认跳过 TypeDoc；本轮其他优化后样本约 39–48 s、3.6–4.7 GiB，说明仍需控制环境噪声。

实际优化包括：用 TypeDoc converter 的现有程序收集依赖，消除二次分析；把编译器放在短生命周期子进程中；跳过关闭更新时间的生成页 Git 查询；将频繁抖动的 128 条 Markdown 缓存改为 2,048 条/32 MiB 双重上限；按真实 glob 过滤监听事件，串行合并生成和搜索更新。普通 Markdown 与缓存目录变更不会触发 TypeDoc，源码改名/删除和失败恢复有测试覆盖。

首轮未通过性能验收：当时冷构建比旧两站顺序耗时合计高约 17%，进程树 RSS 也有所增加。因此继续 profiling、修复并按相同条件重复测量，结果见下方第二轮记录。API 收录范围、链接校验和既有堆阈值均保留。

### 第二轮复测与优化（2026-09-21）

本轮根据 profiling 修复了以下问题：

- Press 侧栏仅渲染展开的子树，首次 SSR 仍展开当前符号所在分组；把折叠默认值与当前分组状态放在同一个监听中，修复客户端导航重建侧栏对象后再次折叠的问题。
- 上一页/下一页仅翻译最终显示的两个链接，按需创建分类树，避免在每页渲染时翻译整个 API 侧栏。
- 增加每个构建上下文独立的 Markdown 解析缓存，最多 2,048 项 / 32 MiB；包含文件与用户前置转换先执行，正文、文件标识和 base 参与缓存键。复用 HTML 的同时恢复独立的页面元数据。异步并发、包含文件更新、自定义不可缓存状态、失败重试、开发实时解析和资源释放均有回归测试。
- 修复 Markdown 首轮渲染的链接收集时机，确保死链检查拿到完整列表，并修正命令页和引用 README 中暴露的 5 处死链。
- 临时 SSR bundle 关闭 gzip 体积估算；增加可选的分阶段构建报告。SSG 并发保持 20，沿用既有堆阈值。显式 GC 和降低并发的实验没有稳定收益，未纳入实现。

复测使用独立的基线和候选工作区，基线为 `0c42fc76`，依赖均按锁文件安装。环境为 macOS arm64、10 个逻辑 CPU、32 GiB RAM、Node 24.18.0、pnpm 12.5.1。三轮交替执行旧 docs + API 与合并站冷/暖构建，记录系统负载和 500ms 采样的整个进程树 RSS。源码指纹变化会让对比失败；此前主工作区并行编辑期间的采样未纳入最终结果。

| 场景 | 三次中位数 | 范围 |
| --- | ---: | ---: |
| 旧 docs + API 顺序耗时合计 | 32.45 s | 31.87–33.93 s |
| 合并站冷构建 | 35.56 s | 33.73–35.65 s |
| 合并站暖构建 | 31.36 s | 30.44–31.41 s |
| 旧站并行关键路径估算 | 21.11 s | 20.90–21.48 s |

冷构建相对旧两站合计增加 **9.6%**，暖构建减少 **3.4%**；不能宣称冷构建已与两站合计持平。三轮合并站最大采样 RSS 为 **4,689 MiB（4.58 GiB）**，旧站为 4,008 MiB。冷构建的生成阶段中位数 3.74 s、client bundle 11.25 s、server bundle 7.72 s、SSG 渲染 9.78 s；暖构建生成阶段降至 0.31 s，每轮均验证 TypeDoc 没有重新分析。

本地采用的预算为：冷构建中位数不超过旧两站顺序耗时合计的 **110%**，整个进程树采样峰值不超过 **6,144 MiB**。本轮通过，冷构建仍接近门槛。以上是墙钟耗时，不是 CPU 时间；并行关键路径由顺序测量估算，未声称实际并行部署已复测。

新增的 `.github/workflows/docs-benchmark.yml` 可指定迁移前 commit，在同一 runner 上执行三轮对比并按上述预算失败退出；普通 Playwright CI 保存每次 docs 构建的分阶段日志与内存报告。公开仓库的 `ubuntu-latest` 当前提供 16 GB RAM，6 GiB 是本项目选择的构建预算，不是托管平台内存上限，参见 [GitHub runner 规格](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)。Cloudflare 构建脚本改用 pnpm 冻结安装，并在发布前执行 API 链接检查。

复现命令（两个工作区都先完成 `pnpm install --frozen-lockfile` 和 `pnpm build`，使用相同 Node/pnpm 版本）：

```sh
DOCS_MAX_COLD_RATIO=1.10 DOCS_MAX_RSS_MIB=6144 \
  node scripts/benchmark-docs-build.mjs /path/to/baseline-worktree /tmp/valaxy-docs-benchmark 3
```

终版回归包括 508 项单元测试、ESLint、类型检查、核心构建、Yun demo 构建、8 项桌面/移动端 SSG 测试，以及 API 输出与旧链接检查。新增 `node scripts/check-typedoc-package.mjs` 在仓库外安装实际 tarball，验证核心/Press/addon 的冷暖 SSG、本地搜索索引、canonical 和锚点；同一检查已接入 CI。最低 peer 版本仍要求包含新核心能力的下次发布。

**本地发布前准备通过；目标 CI 和生产切换尚未执行。** 合并前运行三轮 CI 性能工作流，门槛失败时继续优化。通过后依次预览发布、发布新核心/Press 与 addon、上线主站、重建 Algolia、启用旧域名逐页 301，最后退役旧内容构建。旧站产物与域名切换回退材料继续保留。

### 当时的发布顺序与待办（已由下方执行记录更新）

1. 审阅并合并核心/Press、addon、主站和 Starter 的变更；完成上述目标 CI 性能验收及包发布顺序。
2. 发布主站预览，复核当前旧站 sitemap 与已保存的旧页快照，确认没有新增遗漏。
3. 发布主站 `/api/`，在 Algolia 配置抓取主站共用正文并重新索引，实际验证中英文查询。
4. 按 [旧域名切换说明](../../api/migration/README.md) 部署逐页 301，验证真实状态码、查询参数、锚点及回退。
5. 稳定后移除旧 API 内容 workspace、旧构建脚本和专用依赖；永久保留旧域名与重定向映射。

以上是本地准备阶段的状态；后续实际发布与切换结果见下方记录。

## 第三轮：发布执行与 API 阅读体验（2026-09-21）

- 原始 9.6% 指合并冷构建与旧 docs、API 两次顺序构建墙钟耗时之和的比较。旧 API 使用 VitePress，合并后新增页面进入 Valaxy 双包编译和逐页 Vue SSR，因此合并本身不保证耗时下降。旧两站并行等待时间仍须独立报告。
- CPU 采样确认关闭的移动导航仍在每页 SSR 中实例化。改为打开时渲染；侧栏无子项的符号直接输出叶节点，省去递归组件和折叠状态监听；代码高亮增加每实例 8 MiB 上限的结果缓存。自定义 Shiki hooks 默认不缓存，纯转换可显式启用。
- API 索引加入模块筛选、结果计数、空结果恢复；函数优先于间接导出分组。详情页专门调整签名、来源、章节、表格及移动布局，保持现有主题色与明暗模式。
- 本地通过新增缓存和移动导航回归测试、类型检查、lint、10 项桌面/手机浏览器验证，以及 296 页 API / 4,521 条内部链接 / 600 条旧址规则检查。完整单测中的两项产物检查在构建 Yun demo 后补测通过；没有忽略失败。
- 发布候选设为 Valaxy / Press 等核心包 `1.0.0-rc.13`，TypeDoc addon `0.1.0`。核心 tag 发布限于统一版本的六个包，独立 addon 随后发布。
- 在隔离 worktree `codex/api-docs-release` 推进，未包含其他任务的 VS Code 文档与语言菜单修改。GitHub PR 将触发 Linux 三轮性能对比及跨平台 CI；本轮本地机器负载波动较大，不把单次优化前后耗时当作最终性能结论。
- 已核对 Cloudflare Pages 主站 `valaxy` 与旧站 `valaxy-api`。Algolia 现有抓取因 2026-09-07 记录数下降超过 10% 而暂停；新站上线后需重新抓取并检查，不能直接强制应用旧暂存索引。

## Production cutover (2026-09-21)

The unified API reference is live at <https://valaxy.site/api/>. It keeps the client, node and types entries, one source version/revision, shared API content, locale-preserving navigation and source links. Starter now owns its Press documentation at <https://starter.valaxy.site/docs/> alongside the theme demo at `/`.

Final migration candidate CI benchmark [35531738307](https://github.com/YunYouJun/valaxy/actions/runs/35531738307) used three interleaved rounds on the same Linux runner against `4cb2a1e`. Median old docs + API sequential wall time was **60.152 s**; merged cold build was **61.867 s (+2.85%)**; merged warm build was **54.118 s (-10.03%)**. Sampled process-tree peak RSS was **5,612.3 MiB (5.48 GiB)** against the **6,144 MiB** budget. The old parallel critical-path estimate was **40.89 s**; actual parallel deployment was not measured. These CI numbers supersede the earlier local performance conclusion.

The migration was merged in [#737](https://github.com/YunYouJun/valaxy/pull/737), with the six coordinated packages released as `1.0.0-rc.13`. Live Starter testing then exposed local-search IDs ending in `.html`, which did not match the extensionless Vue routes. [#738](https://github.com/YunYouJun/valaxy/pull/738) fixes that mismatch and extends the isolated packed-consumer browser check to real navigation for authored and generated pages under `/docs/`, released as `1.0.0-rc.14` by [workflow 35534479283](https://github.com/YunYouJun/valaxy/actions/runs/35534479283).

Algolia now crawls `https://valaxy.site/sitemap.xml`, limits headings/content to `main article`, includes API tables and code signatures, and gives API records `lang: ['en', 'zh-CN']`. The clean crawl successfully processed **490 pages**, with **19 ignored URLs**, and published approximately **6,770 records**. The reduction from 12,847 records removed duplicate navigation entries. Actual production queries for `defineSiteConfig`, `loadAllContent`, `ValaxyConfig` and Chinese theme content passed; no sidebar-navigation anchor appeared. The complete previous index and settings are retained as `valaxysite-before-api-cleanup-20260921` and can be copied back through Manage index → Duplicate → existing index.

The final old-site crawl covered 578 HTML URLs. The site did not expose a sitemap; the audit followed its actual reachable links. It identified the newly exported `loadAllContent`, which is now included in the preserved snapshot. The mapper contains **603 HTTP 301 rules** covering 292 legacy content pages, extensionless variants and old index aliases. All preview rules passed real HTTP status/Location/query checks, and a browser followed a legacy function link to the correct main-site `#parameters` section.

Production `api.valaxy.site` now serves the same 603 verified 301 rules; query forwarding passed for every rule and a browser retained the new `loadAllContent#returns` anchor. The old host skips dependency installation and executes only the built-in Node redirect generator. Standalone API sources, workspace membership and dedicated TypeDoc/VitePress bridge dependency were removed after these checks. Press retains its own VitePress style/type dependency. Historical sources and deployment rollback references remain available in [the cutover guide](../../api/migration/README.md).

The independent `valaxy-addon-typedoc@0.1.0` package has passed tarball-consumer checks; its first npm publication still awaits the account owner’s additional npm publish verification. Main-site deployment consumes the workspace addon and is already live.
