# Valaxy 内存优化计划

> 基于对 `packages/valaxy/node/` 的全面分析，按收益排序。
> 
> **最终目标**: `pnpm build:valaxy && pnpm run docs:build` 在 `--max-old-space-size=2048` 下成功完成 ✅

可以参考 vite-ssg 文档能否优化 ssg 的构建内存占用？
https://github.com/antfu-collective/vite-ssg。

## 高收益（各 ~20-50 MB）

### ✅ TODO 1: localSearchPlugin 去掉 Shiki 高亮器
- **文件**: `packages/valaxy/node/plugins/localSearchPlugin.ts`
- **问题**: `createMarkdownRenderer(options)` 创建完整 MarkdownIt + Shiki，但搜索索引通过 `clearHtmlTags()` 丢弃所有 HTML → Shiki 输出完全浪费
- **方案**: 创建一个 `createLightMarkdownRenderer()` —— 使用空的 highlight 函数（直接返回转义文本），跳过 Shiki 初始化
- **预估节省**: ~20-50 MB（一个 Shiki 实例的主题+语法数据）

### ✅ TODO 2: 合并两个 Shiki 高亮器实例
- **文件**:
  - `packages/valaxy/node/plugins/markdown/transform/index.ts`（主插件）
  - `packages/valaxy/node/plugins/markdown/index.ts`（createMarkdownRenderer）
  - `packages/valaxy/node/plugins/markdown/highlighterCache.ts`（新文件：共享实例工厂）
- **问题**: 两者使用完全相同的 `(theme, mdOptions)` 配置，各自调用 `createHighlighter()`
- **方案**: 抽取共享的 Shiki 实例工厂 `getSharedHighlighter()`，引用计数管理生命周期
- **预估节省**: ~20-50 MB

## 中等收益（各 ~5-30 MB）

### TODO 3: vueRouter.ts 复用 MarkdownIt 或使用精简配置
- **文件**: `packages/valaxy/node/plugins/vueRouter.ts:59-60`
- **问题**: 创建第 3 个完整 MarkdownIt 实例（含所有插件），仅用于摘要渲染
- **方案**: 
  - A) 复用主插件的 MarkdownIt 实例（需导出引用）
  - B) 创建精简版：只加载 container/emoji/footnote 等必要插件，跳过 anchor/toc/sfc/lineNumbers 等
- **预估节省**: ~5-10 MB

### ✅ TODO 4: 移除 `_viteConfig` 未使用参数
- **文件**: `packages/valaxy/node/plugins/markdown/markdownToVue.ts`
- **问题**: `_viteConfig: ResolvedConfig` 参数未使用，但闭包持有引用阻止 GC 回收
- **方案**: 删除参数，同步修改调用处 `packages/valaxy/node/plugins/valaxy/index.ts`
- **预估节省**: ~10-30 MB（ResolvedConfig 含全部插件实例）

### ✅ TODO 5: localSearchPlugin HMR 增量更新
- **文件**: `packages/valaxy/node/plugins/localSearchPlugin.ts`
- **问题**: 任何 .md 变更触发 `scanForBuild()` 全量重建（重新渲染所有页面）
- **方案**: 记录 `fileId → docIds[]` 映射，HMR 时用 MiniSearch `discard()` + 重新 `indexFile()` 单文件

## 小优化

### ✅ TODO 6: markdownToVue.ts cacheKey 修复
- **文件**: `packages/valaxy/node/plugins/markdown/markdownToVue.ts`
- **问题**: 外层 `JSON.stringify` 在非 build 模式下白白序列化；内层变量遮蔽重复计算
- **方案**: 将 `JSON.stringify` 移入 `if (isBuild)` 块内

### ✅ TODO 7: vueRouter.ts extendRoute 深拷贝外提
- **文件**: `packages/valaxy/node/plugins/vueRouter.ts`
- **问题**: 每个路由执行 `JSON.parse(JSON.stringify(frontmatter))`
- **方案**: 在 `extendRoute` 外部缓存 frontmatter 模板

### ✅ TODO 8: bundle.ts Map 缓存构建后清理
- **文件**: `packages/valaxy/node/build/bundle.ts`
- **问题**: `cache` 和 `cacheTheme` 两个模块级 Map 永不清理
- **方案**: 导出 `clearBundleCache()` 函数，在 `ssgBuild()` 的 `onFinished` 中调用

## 关键突破（~1300 MB 节省）

### ✅ TODO 9: SSG client build 子进程隔离
- **文件**:
  - `packages/valaxy/node/build.ts` — 添加子进程 client build 逻辑
  - `packages/valaxy/node/cli/build.ts` — 支持 `__VALAXY_SSG_CLIENT_BUILD__` 模式
  - `patches/vite-ssg.patch` — 为 vite-ssg 添加 `skipClientBuild` 选项
  - `packages/valaxy/node/plugins/preset.ts` — `valaxy:memory-release` 插件
- **问题**: vite-ssg 在同一进程中运行两次 Vite build (client + server)，每次 build 在 ESM 模块注册表和 V8 堆中累积 ~1300 MB 不可回收的数据（Rollup module graph、Shiki grammars、UnoCSS engine 等）。两次 build 后堆使用量达 ~1750 MB，留给 SSG 渲染的空间不足 300 MB，导致 OOM。
- **方案**: 当 `--max-old-space-size ≤ 2048`（heap limit ≤ 2560 MB）时:
  1. 在子进程中执行 client build（`valaxy build` + `ssrManifest: true`）
  2. 子进程退出后 ~1300 MB 完全释放
  3. 主进程只执行 server build (~500 MB) + SSG render (~200 MB)
  4. 总内存峰值 ~700 MB，远低于 2 GB 限制
- **额外优化**: 
  - SSG 并发度根据 heap limit 自动调节（≤2GB → concurrency=1）
  - 禁用 beasties (Critical CSS)、html-minifier 在低内存环境
  - 每页渲染后清理 initialState + 触发 GC
- **实际节省**: ~1300 MB（client build 的全部内存占用）

## 执行顺序建议

1. ✅ **TODO 4** → 最简单，改两个文件即可验证
2. ✅ **TODO 6** → 简单修复
3. ✅ **TODO 1** → 高收益，独立修改
4. ✅ **TODO 2** → 高收益，需在 TODO 1 之后
5. ✅ **TODO 7** → 简单
6. **TODO 3** → 中等复杂度（未实现）
7. ✅ **TODO 5** → 复杂度最高（需处理 MiniSearch 增量更新）
8. ✅ **TODO 8** → 简单但收益最小
9. ✅ **TODO 9** → 关键突破：子进程隔离

## 验证方式

```bash
# 2GB 限制下完整构建（目标：成功完成）
pnpm build:valaxy && NODE_OPTIONS="--max-old-space-size=2048" pnpm run docs:build

# 带 GC 追踪
NODE_OPTIONS="--max-old-space-size=2048 --expose-gc" node --trace-gc packages/valaxy/bin/valaxy.mjs build --ssg

# 使用 V8 heap snapshot（开发时）
node --inspect packages/valaxy/bin/valaxy.mjs build --ssg
```
