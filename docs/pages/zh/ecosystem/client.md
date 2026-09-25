---
title: 客户端
categories:
  - ecosystem
---

Valaxy 的写作客户端统一由 **[云栈 CMS](https://cms.yunle.fun)** 承接。Web 和桌面复用一套编辑器，手机端随后推进。Valaxy 继续独立维护框架、CLI、主题与 DevTools，使用 Valaxy 不要求接入云栈。

## 当前状态

云栈 Web 入口已可访问。Electron 桌面端目前为开发预览，已有 macOS arm64 本地验证；正式签名下载、Windows/Linux 安装验证、桌面云同步和手机 App 尚未完成。Web 入口不是桌面安装包下载链接。

## 桌面预览能力

无需登录即可打开或创建本地 Valaxy 博客，编辑 Markdown 和字段、恢复草稿。托管运行时负责真实主题预览和静态构建，执行项目代码前需要明确授权。项目自己的 DevTools 继续提供配置与开发工具入口。

媒体管理、独立元数据表格与目录树、当前文章真实路由、本地 Git 和完整配置适配仍在云栈任务表中。桌面真实账号发布、签名和正式分发需要后续验收。

## 从终端打开

安装云栈桌面端和独立的 `@yunlefun/cms-cli` 后，可以使用：

```bash
yunzhan app .
yunzhan app /path/to/blog
yunzhan doctor
```

本仓库新增的 `valaxy app [path]` 是可选薄转发入口，调用已安装的 `yunzhan`，不把 Electron 加入 Valaxy 依赖，也不会加载项目配置或 Addon CLI。此入口需包含该改动的 Valaxy 版本；已发布的 `1.0.0-rc.15` 尚不包含它。CLI 未发布前请使用云栈仓库提供的本地安装包，不要从 npm 安装其他同名包。

未安装客户端时只提供指引，不自动下载安装。打开项目只授权静态编辑；安装依赖、预览、构建仍需在客户端中明确授权。正在运行任务时不会强行切换项目。

## 历史原型

[valaxy-admin](https://github.com/valaxyjs/valaxy-admin) 是停止独立开发的 Tauri 原型，保留源码历史；本仓库原有的 Electron 原型也由云栈桌面接续。产品归并不表示旧原型每项交互已全部等价覆盖。

已有博客保留在原目录。先保存旧应用中的编辑并退出，再在云栈选择同一个项目。迁移验收前保留旧应用数据，无需重建文章、图片、配置或 Git 历史。
