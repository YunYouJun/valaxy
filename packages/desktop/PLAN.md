# Electron 原型实现与迁移记录

本文记录现有 Valaxy Desktop 预览版的实现与历史验证，不再作为本仓库客户端开发计划。所有客户端与 Valaxy 第一方适配改在 `YunLeFun/cms` 实现，主计划位于该仓库的 `specs/valaxy-first-party-client/`。本目录是待迁移资产，具体处理见 [迁移索引](./CMS-INTEGRATION-PLAN.md)。

## 产品目标与选型

目标用户为零基础写作者：安装客户端，创建博客，写作预览，发布并拿到可访问的链接。第一版发布适配器暂定 Cloudflare Pages。

DevTools 负责已运行项目中的文章、配置和资源操作；桌面端负责项目创建、运行环境、进程生命周期和发布。两者复用同一套编辑能力。Electron 与现有 Node/Vite 工具链衔接直接，因此优先用它完成产品闭环；Tauri 的包体优势留待实际安装包数据和维护成本评估。

## 模块边界

```text
Vue 桌面界面 → 命名 IPC → Electron 主进程
                           ├─ 项目与最近使用记录
                           ├─ 内置 Node + pnpm → 安装 / 预览 / SSG
                           └─ Wrangler → 浏览器授权 / Pages 发布

桌面界面 → 本机 DevTools iframe → 文章与配置 RPC
         → 本机站点 iframe     → 实时预览
```

渲染进程启用 sandbox 和 context isolation，不暴露 Node 或任意命令执行。项目配置在独立 Node 进程中运行；预览仅监听回环地址，构建分配 4 GB 堆，应用退出时清理所属进程。文章正文写入保留 frontmatter，使用修订号检查和串行写入避免覆盖冲突。

界面遵循 Valaxy 官网的蓝紫品牌、无衬线标题与细线分栏，参考 Vite 官网的留白和结构；跟随系统明暗主题。侧栏管理项目，工作区提供写作、预览、构建与发布；运行日志按需展开。发布必须通过显式操作触发。

## 里程碑和验收

| 阶段 | 交付内容 | 验收方式 | 当前进度 |
| --- | --- | --- | --- |
| M1 项目运行 | 打开、最近项目、启动/停止预览、日志、构建、退出清理 | 生命周期单测与真实 Electron | 已实现 |
| M2 零基础创建 | 模板、内置 Node/pnpm、依赖安装、失败重试 | 无系统 Node 的创建与预览 E2E | 已实现 |
| M3 写作 | 复用 DevTools，补正文编辑、保存与冲突保护 | 文件写入回归和真实编辑 E2E | 已实现 |
| M4 发布 | OAuth、账号与站点选择、构建、上传、返回链接 | 适配器单测 + 真实账号发布 | 已实现，真实发布待验收 |
| M5 发行 | 各平台安装包、签名、公证、安装验证 | CI 构建与新机器验收 | macOS arm64 未签名包已验证，正式发行待验收 |

### 本地验证记录

- 核心包构建、仓库与桌面端类型检查、改动文件 ESLint 均通过。
- `test/desktop` 和 `test/devtools`：11 个测试文件、61 项测试通过。
- 开发模式 Electron E2E 通过（23.4 秒），覆盖创建、安装、自动配对、编辑、预览、构建成功、构建失败和退出。
- 直接启动打包后的 macOS arm64 应用，同一套 E2E 通过（28.4 秒）；两次均移除系统 Node 路径。
- 生成 `release/Valaxy Desktop-0.1.0-arm64.dmg`，约 219 MiB，尚未签名或公证。
- 发布适配器使用模拟 Cloudflare API/CLI 验证；没有执行真实账号登录、创建云端站点或上传。

### 迁移后发行必须完成（在 CMS 验收）

- [ ] 使用真实 Cloudflare 账号完成首次发布，再次修改文章并发布，确认线上内容更新。
- [ ] 验证授权取消、授权过期和网络中断后的用户重试流程。
- [ ] 补齐 Windows/Linux 安全凭据组件的随包提供与检查：Wrangler 的 keyring 模式分别依赖 `@napi-rs/keyring` 和 `secret-tool`，不能要求新手手动配置。
- [ ] 在 macOS、Windows、Linux 新环境中验证安装、创建、退出无残留进程。
- [ ] macOS 签名、公证与 Windows 签名，确认系统安装体验。
- [x] 使用 Devframe 的限时授权链接自动配对编辑器，避免新手需要查看日志。
- [ ] 记录安装包体积、首次安装耗时、预览内存与实际构建内存。

### 后续归属与清理

当前 Electron 主进程、运行时准备、Valaxy 本地项目能力、发布 Adapter 与测试迁入 CMS `apps/desktop`。云栈内部统一工作台与草稿逻辑，第一方承接内容、配置、主题、预览、构建和发布；本地编辑仍无需账号。本仓库不再推进独立客户端功能，`valaxy-addon-ylf-cms` 不在本轮范围。

主计划已迁入 CMS，见 [迁移索引](./CMS-INTEGRATION-PLAN.md)；产品与视觉参考见 [产品方向](./PRODUCT-DIRECTION.md)。代码迁移、工作台整合、云同步和手机入口尚未实现。当前安装包与用户数据保持原样，迁移时重新验证；以上历史结果不算作 CMS 迁移版的验收。

CMS 迁移版验收后再移除本仓库客户端目录、专属测试/脚本/依赖与安装包工作流；保留通用框架接口、DevTools 修复与其他工作，不批量回滚当前工作区。

第一版不实现自建托管服务。签名、公证和真实账号发布的结果不能由本地测试或模拟 API 代替。

## 参考

- [Electron 安全指南](https://www.electronjs.org/docs/latest/tutorial/security)
- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Wrangler 命令](https://developers.cloudflare.com/workers/wrangler/commands/)
