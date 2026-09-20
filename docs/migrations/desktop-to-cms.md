# Electron 原型退出记录

客户端后续统一在云栈实现。Valaxy 不再维护独立 Electron 宿主；框架、CLI、主题、DevTools 与公共 Node API 留在本仓库。公开产品说明见 [客户端](../pages/zh/ecosystem/client.md) 和 [云栈](https://cms.yunle.fun)。

## 接收版本与资源

CMS 接收提交：`YunLeFun/cms@5d4126f392734f742fc8abe5455707d909dfdf7c`，分支 `codex/valaxy-desktop-migration`，已保存到 [CMS 迁移 PR #72](https://github.com/YunLeFun/cms/pull/72)。该提交包含共享编辑器、Web 回接、Electron 宿主／测试／CI 和完整后续任务表；尚未合并到 CMS main。

默认使用 npm Valaxy/Yun `1.0.0-rc.12`，Node `24.18.0`、pnpm `10.33.0` 和 runtime API `1`。CMS 只需自身检出即可准备资源，不依赖旧目录、旧脚本、ignored tarball 或相邻 Valaxy checkout。资源记录版本和 SHA-256；真实创建、预览和 SSG 已验证。

## 退出范围

- 删除 `packages/desktop`、`test/desktop`、桌面根脚本、专用 Electron/builder/捆绑 pnpm 依赖和 `.github/workflows/desktop.yml`。
- CMS 接收 Linux executableName 与 CI 4 GB 堆修复；其 pnpm 10／registry 路径不需要原型升级后的 pnpm 12 原生调用和 workspace catalog 展开。
- 保留 `desktopRuntimeVersion`、`startValaxyDev`、`execBuild`、CLI、DevTools 正文／配置和通用测试。Valaxy 继续可独立使用，不依赖 CMS。
- 删除后 `pnpm install --frozen-lockfile`、`pnpm build`、`pnpm typecheck`、54 文件／468 单测、改动文件 ESLint 与 `pnpm docs:build` 通过；中英文客户端页面的静态产物均包含 CMS 入口。通用 workspace hoisting 保持原行为，只移除捆绑 pnpm 的专用排除项。

## 已有项目、数据与历史

旧项目保持原路径，在云栈“打开项目”即可；旧 `projects.json` 可在两端关闭且新列表不存在时复制。云栈应用标识为 `fun.yunle.cms`，原型为 `site.valaxy.desktop`；用户数据目录彼此独立。历史路径不授予执行权限，不自动复制凭据，不清空旧目录。接续、草稿和回退细节在 CMS `apps/desktop/MIGRATION.md`，旧历史接续已有隔离回归。

旧 Electron 完整源码与原计划保留在 [Valaxy@06b505d3](https://github.com/YunYouJun/valaxy/tree/06b505d3/packages/desktop)。需要复查时用独立 checkout，勿覆盖当前博客。`valaxy-admin` Tauri 原型的归档说明见 [归档说明 PR](https://github.com/valaxyjs/valaxy-admin/pull/1)；目前只是提出归档说明，未合并或执行远端仓库归档。

## 验收边界

CMS 完整发布检查通过（111 文件、599 单测）；registry 资源路径下源码／macOS arm64 打包应用各 4 项 Electron E2E 通过，覆盖无系统 Node 建站、正文／字段、DevTools、真实主题与 SSG、旧历史接续、重启恢复和信任隔离。另在接收提交的独立干净检出完成冻结安装、registry 资源准备、源码 4 项 E2E、未签名 DMG 生成，以及打包应用 4 项 E2E（52.5 秒）。CMS 的 macOS／Windows／Linux 远端 CI 均已实跑通过：源码／打包应用 E2E、未签名 DMG／NSIS／AppImage 生成与上传。结果见 [macOS](https://github.com/YunLeFun/cms/actions/runs/35505692275/job/106065047903)、[Windows](https://github.com/YunLeFun/cms/actions/runs/35505692275/job/106065047880) 和 [Linux](https://github.com/YunLeFun/cms/actions/runs/35506290139/job/106066556826) 验收。沙箱保留，但新设备安装、签名与升级仍未验收，不能视作正式三平台发行。

云同步、手机、图片／目录检索、本地 Git、完整配置适配、真实账号发布、签名公证和升级验证保留在 CMS P0–P7 主任务表；删除重复宿主不代表整个任务表已经完成。
