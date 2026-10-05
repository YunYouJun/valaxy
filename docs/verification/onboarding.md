# 从创建博客到首次构建的验收记录

验收日期：2026-10-05（Asia/Shanghai）。起始提交：`c7c5bbb56dccc9d85471029b04d820dda60f99c5`。

范围：默认 Blog / Yun 路径，使用当前仓库的真实打包产物，在仓库外创建、安装、启动、写文章、修改配置、构建和预览。不发布 npm 包，不创建版本标签。

## 复现方法

在仓库根目录，使用 Node.js `>=22.12.0` 和仓库指定的 pnpm：

```bash
pnpm install --frozen-lockfile
# 仅在尚未安装测试浏览器时执行
pnpm exec playwright install chromium
pnpm test:onboarding
```

脚本会构建核心包和脚手架，再分别 `pnpm pack`：

- `create-valaxy`
- `valaxy`
- `@valaxyjs/utils`
- `@valaxyjs/devtools`
- `valaxy-theme-yun`
- `valaxy-addon-girls`

随后在系统临时目录中通过 `pnpm --package=<create-valaxy.tgz> dlx create-valaxy valaxy-blog --yes` 创建全新博客。`--yes` 对应文档里的 Blog、Yun 和手动安装选项。脚手架交互问题另由 `test/create-valaxy-cli.test.ts` 覆盖，并在本轮用真实打包 CLI 的交互终端复核。

仅在生成项目的 `pnpm-workspace.yaml` 中追加上述自有依赖的本地 tarball overrides；保留模板的安装配置。第三方依赖正常从 registry 安装，不复制仓库的 node_modules、锁文件、catalog、补丁或依赖 overrides。脚本检查核心包和主题实际解析到临时项目内。

已经执行过 `pnpm build` 时，可以使用 `pnpm test:onboarding --skip-build` 跳过核心包重建；脚手架仍会重建，所有包仍会重新打包，项目仍会重新创建。此次最终验收采用该选项，核心包已在最终 CLI 修改后重新构建。

日志、页面截图和包含通过状态的 `record.json` 默认写入 `test-results/onboarding/`；可用 `VALAXY_ONBOARDING_ARTIFACTS` 指定其他输出目录。临时项目和 tarball 会保留，具体路径见脚本输出或 `record.json`，开发和预览服务器则自动关闭。第三方依赖可能随 registry 更新，精确重放可使用保留下来的 `pnpm-lock.yaml` 与 tarball。

完整验收通过后，脚本还会从真实 `dev.log` 自动更新 `docs/generated/startup-output.txt`，供中英文快速开始展示。它保留首次启动完成前的实际日志，统一示例路径和端口，去掉耗时、网卡地址、ANSI 控制码和临时进度；新增日志会自然进入示例。验收失败或输出不完整时不覆盖现有示例。版本号由展示组件读取对应包，独立跟随版本更新；日志正文在下次成功运行 `pnpm test:onboarding` 后更新。

要检查未配对的原生 DevTools 在长时间停留时是否报错，追加 `--check-unpaired`。此模式在首次加载后保持页面和服务器运行 65 秒，超过 Devframe 的 60 秒授权等待期限，再检查浏览器错误。它不自动授权、不关闭页面，也不忽略 RPC 错误：

```bash
pnpm test:onboarding --skip-build --check-unpaired
```

收到 SIGINT 或 SIGTERM 时，脚本先关闭浏览器，再停止所有命令的进程组并写入失败记录。子进程在 5 秒内不退出时使用 SIGKILL；命令超时也会等待这一清理完成。测试覆盖忽略 SIGTERM 的后代进程。Windows 不使用 POSIX 进程组，此回归测试在 Windows 上跳过。

## 问题、原因与修复

| 问题 | 复现证据与原因 | 修复与回归覆盖 |
| --- | --- | --- |
| pnpm 12 首次安装退出 1 | `ERR_PNPM_IGNORED_BUILDS`，涉及 `@parcel/watcher`、`esbuild`、`vue-demi`。旧模板只有 `_npmrc`，没有构建脚本权限；pnpm 11 起非 registry 配置改用 YAML，未审核脚本默认阻止安装 | 模板改为 `pnpm-workspace.yaml`，允许 esbuild / vue-demi、跳过 @parcel/watcher，并迁移 hoist 和 peer 配置。安装测试通过本地 registry 的模拟包证明：旧配置失败、新配置成功、被拒绝脚本未执行 |
| 新博客包含旧构建产物 | 初始 tarball 包含 `template-blog/dist/`、`.valaxy/`、`.env.example` 和 `public/` 下生成的 RSS / 搜索数据。`files: ["template-*/**/*"]` 将本地生成文件也打包了 | 明确排除模板内构建、缓存、环境、日志、RSS 和搜索产物。真实 `pnpm pack` 回归先失败后通过，并验证源码、配置、图标和 CLI 仍在包中。排除规则必须放在包含规则之后，增加了该 manifest 的 lint 例外防止排序改变语义 |
| 冷启动首次点击文章回到首页 | 全新项目的第一次文章导航触发可选评论插件的预打包，日志出现 `dependencies optimized: valaxy-addon-artalk ...` 和 `optimized dependencies changed. reloading`，30 秒后 URL 仍为首页。热缓存后不复现 | Yun 将三个可选评论插件及其子路径排除出预打包；未启用时它们本来就解析到空模块。完整验收脚本在全新依赖缓存下只点击一次新文章链接并检查 URL / 正文，覆盖此行为 |
| 生产页面水合不一致，文章前后链接不同 | 首次详细诊断显示服务端日期 tooltip 为 `00:00`、浏览器为 `08:00`；相邻文章链接也不同。模板未指定展示时区，`valaxy new` 又生成没有时区的日期时间，不同环境解析为不同时间点 | Yun / Press 模板分别明确 `Asia/Shanghai` / `UTC`；文档示例保留 timezone。CLI 改为生成带偏移的 ISO 日期时间。回归用真实新文章输出在 UTC、上海、洛杉矶分别解析，要求时间戳相同；生产浏览器故意使用洛杉矶时区检查水合。此次不改变已有站点的默认时区语义 |
| pnpm 构建出现 npm 配置警告 | 模板 `build` 调用 `npm run build:ssg`，npm 对 pnpm 配置报告多条 `Unknown ... config` | `build` 直接执行 `valaxy build --ssg`，完整验收确认仍然生成静态 HTML |
| 文档无法独立指导完整流程 | 原快速开始没有文章和生产构建步骤；站点配置指向 `valaxy.config.ts`；示例缺少选主题提示；README 仍称中英文文档未完成；预览端口写死 | 中英文快速开始、CLI 示例、模板 README 和示例文章同步更新，补充 site / theme 配置区别、时区、实际端口、构建和预览验收点。验收脚本直接读取中文文档中的 Markdown 和 site.config.ts 代码块，避免测试示例与文档分离 |

pnpm 行为依据：[pnpm 11 release notes](https://pnpm.io/blog/releases/11.0)，[allowBuilds 从 pnpm 10.26 开始提供](https://pnpm.io/blog/releases/10.26)。因此修订后的入门路径要求 pnpm `>=10.26.0`，本轮实际使用 pnpm `12.5.1`。

后续文档复核保留了醒目的版本兼容提示框，并依据本次 `dev.log` 增加默认展开、仍可收起的启动输出示例。原组件中被注释的 `v0.15.5` 示例已由当前输出替代；运行时配置解析、版本、主题和路径日志始终保留。创建与启动示例中的版本分别读取对应包的 `package.json`，避免写死旧版本。补充后再次通过相关文件 lint 和文档构建，并在浏览器中验证中英文兼容提示、启动示例及版本显示。

## 验收内容

自动化覆盖：

1. 创建时不携带 dist、缓存或旧 feed，正常安装依赖。
2. 开发服务器首页显示 Hello, Valaxy!。
3. 按文档添加 `pages/posts/first-post.md`，无需手动刷新，首页出现新文章。
4. 按文档修改 `site.config.ts`，浏览器标题、站点名称与文章作者更新。
5. 首次点击文章即进入 `/posts/first-post`，正文正确、无 Vite 错误覆盖层。
6. 运行 `pnpm exec valaxy new cli-post`，生成文件可访问。
7. 停止开发服务器，执行 `pnpm build`，生成首页和三篇文章的静态 HTML。
8. sitemap 与 RSS 包含 `https://example.com/posts/first-post`。
9. 运行 `pnpm serve`，首页点击、文章直接打开和刷新均成功；禁用 JavaScript 时仍能读取文章正文。
10. 示例封面的按钮在水合后仍可切换状态；跨时区浏览器没有 pageerror、console error 或 hydration mismatch。

浏览器脚本为可选的 `https://v1.hitokoto.cn` 随机语录提供固定测试响应。此前实网完整验收已经通过，重复验收中出现过一次等待首页 `networkidle` 超时；固定该外部服务响应可避免入门验收依赖随机内容和该服务的可用性。页面、路由、样式、依赖安装和本地构建均使用真实产物。

最终结果见下方记录。

## 本次结果

环境：macOS / arm64，Node.js `24.18.0`，pnpm `12.5.1`，Chromium `153.0.8010.12`。生成项目实际安装 Vue `3.5.43`、Vue Router `5.3.1`、Vite `8.3.2`。

最终干净项目：`/private/var/folders/tx/zs0fhdtn52l29nbtqby57qlh0000gn/T/valaxy-onboarding-t8rND4/valaxy-blog`。该路径是本机留存证据；在其他机器运行上面的命令会生成新的临时路径。

`test-results/onboarding/record.json`：`passed: true`，`errors: []`，`networkFailures: []`。首页和文章页截图已人工检查；首页截图等待入场动画结束后再保存。修复后的干净项目已完整走通；最终一次还等待首页介绍区域实际可见且淡入完成，再核对站点名称和保存截图。

另用真实打包的 CLI 在交互终端逐项选择 **Blog → Yun → valaxy-blog → No**，提示顺序和输出命令与文档一致，退出码 0。项目保留在 `/tmp/valaxy-onboarding-gtjxcR/interactive/valaxy-blog`。

| 检查 | 结果 |
| --- | --- |
| `pnpm build`，最终 CLI 修改后再次 `pnpm build:valaxy` | 通过 |
| `pnpm build:create-valaxy` 与所有验收包的 `pnpm pack` | 通过 |
| `pnpm test:onboarding --skip-build` | 通过，包含生产构建与浏览器验收 |
| `pnpm typecheck` | 通过 |
| `pnpm test --run` | 96 个测试文件、667 个测试通过 |
| `pnpm lint` | 通过 |
| `pnpm docs:build` | 通过 |
| `git diff --check` | 通过 |

### 启动示例自动更新的后续验证

- 中英文示例默认展开，浏览器验证可收起和重新展开；静态 HTML 同样包含 `open`，版本占位符已替换。
- `pnpm exec vitest run test/onboarding-output.test.ts`：4 个测试通过，覆盖路径、端口、耗时和 ANSI 归一化，Windows 换行与路径，新增启动日志自动保留，以及不完整输出拒绝更新。
- 相关文件 lint、`pnpm docs:build` 和 `git diff --check` 通过。当前生成样本来自上文已通过验收的 `t8rND4` 项目的真实日志。
- 接入自动更新后另跑了两次完整验收，第二次等文档构建结束后单独运行。两次均完成博客生产构建和页面断言，但最终浏览器错误汇总检查捕获到 `[devframe] Timeout waiting for rpc to be trusted`，因此退出 1，**没有覆盖文档样本**。证据分别位于 `test-results/onboarding-output/record.json` 和 `test-results/onboarding-output-retry/record.json`；第二次还记录一次开发页面导航的 `net::ERR_ABORTED`。这两次复验不记为通过，RPC 超时原因仍待定位。本次文档跟进没有修改 CLI 或 DevTools 运行行为。

### 独立复核

以远程 `main` 的 `05b8c45bf7dbb5042e2d49ad4d91b7f842ba66fc` 为基线，独立克隆并复制待审改动，重新安装和构建。`pnpm build:all`、`pnpm build:demo`、`pnpm docs:build`、`pnpm typecheck`、`pnpm lint` 通过。完整单元测试通过 98 个文件、673 个测试；随后补充命令超时回归，与 SIGINT / SIGTERM 回归一起验证进程清理。

默认 `pnpm test:onboarding --skip-build` 在新的打包项目中通过，记录为 `passed: true`、`errors: []`、`networkFailures: []`。本次成功日志再次生成启动示例。

扩展的 `--check-unpaired` 验收失败，捕获同一 RPC 超时。独立对照证明：不修改配置、不导航、不停止服务器，仅保持首次加载页面，也在约 65 秒后出现错误。因此，此问题不能归因为测试停服。较快完成的默认验收可能早于授权期限结束，不能据此认定未配对连接正常。

根因位于 `@devframes/hub-ui@1.2.0` 的 [消息状态初始化](https://github.com/devframes/devframe/blob/72d917d5a57837b748bc9c950a0216049d13363e/packages/hub-ui/src/client/state/messages.ts#L88)：原生工具栏的通知组件调用 `ensureTrusted().then(refresh)`，却未处理授权超时。Valaxy 页面桥接没有调用该方法。仅捕获拒绝还会遗漏迟到授权后的首次刷新，正确修复需要依据信任状态变化加载消息。

复核时上游 `main` 仍有此调用；Vite DevTools `0.7.6` 仍依赖同一 Hub UI，升级它不能修复该问题。Valaxy 的 Open/Shiki 服务隔离、认证规则和原生工具栏接入保持原状，没有新增依赖源码补丁。未配对验收仍是已知阻断，不能将本次结果表述为全部通过。

本轮保留的非阻塞信息：

- 第一轮使用机器全局 pnpm `10.13.1`，依赖脚本只产生警告，npm 源发生短暂 `ENOTFOUND` 后自动重试成功；正式复验使用仓库指定的 `12.5.1`，因此发现并修复了安装退出问题。
- 本地 tarball overrides 使 pnpm 的 peer 检查将 Valaxy 标为 `file:../packages/valaxy-1.1.0.tgz`，无法与 girls addon 的 `>=1.0.0-rc.2` 比较而给出警告。实际安装包版本为 `1.1.0`，运行和构建通过；这是本次本地打包注入的检查边界。
- 文档构建已有的 TypeDoc 引用警告、第三方 git-log addon 的浏览器 `node:process` 提示与 Rolldown 性能提示不阻止构建；本轮没有扩展到这些模块。文档构建产生的 contributors 索引变更已还原。
- 开发/预览日志中的 SIGTERM / 143 来自验收脚本主动停止服务器，不是启动或构建失败。

未执行版本发布、tag、push 或部署。
