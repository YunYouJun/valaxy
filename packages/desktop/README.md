# Valaxy Desktop 原型（待迁移）

本目录保留面向零基础写作者的 Electron 原型，作为云栈桌面端的迁移资产。已有创建博客、依赖准备、Markdown 编辑、预览、构建和 Cloudflare Pages 发布入口；后续客户端功能与 Valaxy 第一方适配统一在 `YunLeFun/cms` 实现。

原型的本地写作与构建已有真实 Electron 测试；真实账号发布、跨平台安装和签名仍需在迁移后的云栈桌面验收，见 [历史实现与迁移记录](./PLAN.md)。

主计划位于 CMS 仓库 `specs/valaxy-first-party-client/`，本仓库仅保留 [迁移索引](./CMS-INTEGRATION-PLAN.md)。迁移尚未实施；以下包名与命令仍用于原型复现，迁移验收后再清理原目录与构建入口。

## 开发

在仓库根目录执行：

```bash
pnpm install
pnpm build
pnpm -C packages/desktop prepare:runtime
pnpm desktop:dev
```

`prepare:runtime` 下载并校验当前平台的 Node.js 24.18.0，复制 pnpm 10.33.0，安装固定版本 Wrangler 4.135.0，并打包工作区中的 Valaxy、DevTools、工具包、Yun 主题和主题依赖。修改这些包后，需要重新运行 `pnpm build` 和 `prepare:runtime`。

安装后的应用使用内置 Node 和 pnpm，用户无需预装开发环境。首次创建博客仍需要联网下载依赖。博客保存在用户选择的本地目录，内置框架包复制到 `.valaxy/desktop-packages`，通过 `file:` 依赖和 pnpm overrides 引用，并继承仓库经过验证的依赖兼容版本；迁移到公开版本时需同时修改两处声明。

## 写作与发布

1. 点击「创建我的博客」，填写名称和作者，选择保存位置。
2. 等待依赖安装和预览启动。安装失败可直接重试。
3. 编辑器通过 Devframe 的限时授权链接自动配对，无需复制验证码。
4. 在文章面板编辑 Markdown 正文，点击保存。未保存的草稿保留在当前编辑器会话中；关闭前需保存。外部修改导致版本冲突时，编辑器会拒绝覆盖文件。
5. 在发布面板通过浏览器登录 Cloudflare，选择账号和 Pages 项目名，创建或连接站点。
6. 点击发布，应用以站点的实际 URL 重新构建，上传并核验当前部署成功后显示访问链接。

首次登录需要 Cloudflare 账号。授权使用 Wrangler 的浏览器 OAuth 和系统凭据存储；沿用 Wrangler 默认登录状态，可能与本机已有 Wrangler 登录共享。凭据不会写入博客、渲染进程或运行日志。发布目标暂不持久化，重新打开工作台后需要再次连接。

当前优先验证 macOS。Windows/Linux 的安全登录分别还依赖 Wrangler 的 `@napi-rs/keyring` / `secret-tool` 组件，随包提供和新机器验证尚未完成，因此暂不视为可交付的新手发布流程。

打开已有博客时，项目的 Valaxy 版本必须提供 `desktopRuntimeVersion: 1`，并启用 DevTools 才能使用内嵌编辑器。

## 验证

```bash
pnpm -C packages/desktop typecheck
pnpm exec vitest run test/desktop test/devtools
pnpm -C packages/desktop test:e2e
```

Electron E2E 在移除系统 Node 路径的环境中验证创建、安装、编辑、预览、SSG、失败构建和进程退出。发布适配器使用模拟 API/CLI 验证权限过期、项目创建、实际域名及部署失败，不代表真实账号发布已验收。

设置 `VALAXY_DESKTOP_EXECUTABLE` 为打包后的可执行文件绝对路径，再运行 `pnpm -C packages/desktop exec playwright test -c playwright.config.ts`，可以对安装包中的应用运行同一套 E2E。

## 打包

先完成核心包构建，再执行：

```bash
pnpm desktop:pack
# 或生成当前平台安装包
pnpm -C packages/desktop dist
```

输出目录为 `packages/desktop/release`。资源与打包宿主的平台、架构匹配，应分别在 macOS、Windows、Linux 上构建，不能直接跨平台复用 `resources`。手动触发的 `desktop.yml` 工作流生成未签名预览安装包，默认不发布 GitHub Release。

对外正式发行前，需要完成 macOS 签名、公证及 Windows 签名，验证新机器安装和真实 Cloudflare 发布。自动更新暂未实现。
