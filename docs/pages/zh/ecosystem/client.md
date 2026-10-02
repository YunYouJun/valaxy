---
title: 客户端
categories:
  - ecosystem
---

Valaxy 的写作客户端统一由 **[云栈 CMS](https://cms.yunle.fun)** 承接。Web 和桌面复用一套编辑器，手机端随后推进。Valaxy 继续独立维护框架、CLI、主题与 DevTools，使用 Valaxy 不要求接入云栈。

## 当前状态

**[下载云栈桌面版](https://cms.yunle.fun/download)** · [打开网页版](https://cms.yunle.fun)

云栈 0.1.1 已正式发布 macOS Apple Silicon（M 系列）安装包，完成 Developer ID 签名、Apple 公证及原生安装和升级验收。下载页自动显示最新正式版本和可用平台；打开 DMG 后，将云栈拖入“应用程序”即可，无需预先安装 Node.js。

当前要求 macOS 13.5 及以上；Intel Mac、Windows 和 Linux 暂无公开安装包。桌面云同步仍在开发，云端编辑与发布可使用网页版；手机 App 随后推进。

## 桌面写作

无需登录即可打开或创建本地 Valaxy 博客，编辑 Markdown 和字段、恢复草稿。托管运行时负责真实主题预览和静态构建，执行项目代码前需要明确授权。项目自己的 DevTools 继续提供配置与开发工具入口。

本地文章和草稿保留在你的电脑，安装、预览与构建使用随应用提供的运行环境。后续版本可在应用设置中检查更新；请从官方下载安装包，无需关闭系统安全保护。

## 从终端打开

安装云栈桌面端和独立的 `@yunlefun/cms-cli` 后，可以使用：

```bash
yunzhan app .
yunzhan app /path/to/blog
yunzhan doctor
```

本仓库新增的 `valaxy app [path]` 是可选薄转发入口，调用已安装的 `yunzhan`，不把 Electron 加入 Valaxy 依赖，也不会加载项目配置或 Addon CLI。`valaxy app` 已包含在 `1.0.0-rc.16` 及后续版本中。CLI 未发布前请使用云栈仓库提供的本地安装包，不要从 npm 安装其他同名包。

未安装客户端时只提供指引，不自动下载安装。打开项目只授权静态编辑；安装依赖、预览、构建仍需在客户端中明确授权。正在运行任务时不会强行切换项目。

## 历史原型

[valaxy-admin](https://github.com/valaxyjs/valaxy-admin) 是停止独立开发的 Tauri 原型，保留源码历史；本仓库原有的 Electron 原型也由云栈桌面接续。产品归并不表示旧原型每项交互已全部等价覆盖。

已有博客保留在原目录。先保存旧应用中的编辑并退出，再在云栈选择同一个项目。迁移验收前保留旧应用数据，无需重建文章、图片、配置或 Git 历史。
