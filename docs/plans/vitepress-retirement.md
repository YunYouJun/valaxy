# VitePress 退役计划

日期：2026-09-21。范围：在 API 已接入官网构建的基础上，完成仓库侧旧站退役。

## 已确认的前提

- `docs/valaxy.config.ts` 已注册 `valaxy-addon-typedoc`，三个入口由 `docs/typedoc.json` 管理。
- 旧优化笔记已原样迁入 `docs/pages/dev/notes/`。
- Press 已自带样式、来源许可和侧栏类型，docs 已移除 VitePress 命令及依赖。
- Playwright CI 已构建统一官网并运行 `verify:api`，不再构建独立 API 站。

## 实施顺序

- [x] 将旧页快照与域名切换说明移到 `deploy/api-redirects/`，更新校验脚本及文档引用。
- [x] 移除旧 `api/` 内容、VitePress 配置、workspace、`api:*` 命令和 ESLint 专用配置。
- [x] 清理 `vitepress`、`typedoc-vitepress-theme`、旧站独占的 `oxc-minify` 及锁文件；保留 `typedoc`、`typedoc-plugin-markdown`、`vitepress-plugin-group-icons`。
- [x] 默认 CI 只校验新官网 API 链接；旧域名兼容及重定向生成改为显式可选操作。
- [x] 冻结安装、构建官网，检查官网链接与锚点、单元测试、类型、lint 和桌面/移动端导航。

## 完成边界

官网只需 `pnpm docs:build`，API 内容由 TypeDoc → addon → Markdown → Valaxy/Press 统一生成。
`pnpm verify:api` 只校验官网产物。旧页快照保留作参考；需要兼容旧链接时，显式执行
`pnpm verify:api --legacy-redirects` 才生成 `deploy/api-redirects/dist/`，该目录只供旧域名使用。
历史构建基准继续在迁移前的独立 worktree 执行 `api:build`，候选版本只构建官网。

生产主站、Algolia 索引与旧域名 301 已在前序迁移中完成切换；本次只清理仓库依赖与默认构建路径。
回退继续依赖旧部署产物、旧站 Git 历史及主站上一部署，不再让当前仓库安装旧站依赖。

## 本地执行结果

- 冻结离线安装通过，workspace 从 26 个减到 25 个。
- 依赖树及锁文件中不再包含 `vitepress`、`typedoc-vitepress-theme`、`oxc-minify`；核心仍依赖 `vitepress-plugin-group-icons`。
- 核心包和官网 SSG 构建通过；默认校验覆盖 296 个 API HTML 输出、4,527 条内部链接，不生成重定向产物。
- 16 项相关单元测试、8 项桌面/移动端 E2E、全仓 ESLint 和 Vue/TypeScript 检查通过。
- 目标 CI 尚未执行；生产切换沿用前序迁移已经验证的部署。
