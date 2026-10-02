---
title:
  en: Client
  zh-CN: 客户端
categories:
  - ecosystem
---

The Valaxy writing client is provided by **[Yunzhan (云栈)](https://cms.yunle.fun)**. CMS provides one shared editor for Web and desktop, with mobile planned next. Valaxy continues to maintain its framework, CLI, themes and DevTools independently; using CMS is optional.

## Public preview

**[Download the preview app](https://cms.yunle.fun/download)** · [Open the Web app](https://cms.yunle.fun)

Yunzhan is in **public preview (Beta)**. No invitation is needed. Version 0.1.1 is available for macOS Apple Silicon (M series), with Developer ID signing, Apple notarization and native installation and upgrade verification. These checks confirm the installer and update path; the app's features and interfaces may still change. Back up important content before trying it, and report problems through [support](https://support.yunle.fun/).

The download page shows the latest public installer and supported platforms. Open the DMG and drag Yunzhan into Applications; Node.js does not need to be installed separately.

macOS 13.5 or later is required. Public installers for Intel Mac, Windows and Linux are not available yet. Desktop cloud sync is still in development; use the Web app for cloud editing and publishing. Mobile is planned.

## Desktop writing

The desktop app can open or create local Valaxy blogs, edit Markdown and fields without login, recover drafts, run a real theme preview and build static output using a managed runtime. Project code only runs after an explicit local trust action. The project's DevTools remains available for configuration and development tools.

Local articles and drafts stay on your computer. Installation, preview and builds use the runtime bundled with the app. Check for later versions in application settings, and download from the official source without disabling system security protections.

## Open from a terminal

With the desktop app and the separate `@yunlefun/cms-cli` installed:

```bash
yunzhan app .
yunzhan app /path/to/blog
yunzhan doctor
```

This repository adds `valaxy app [path]` as an optional thin forwarder to the installed `yunzhan` command. It never loads project config or addon commands, and does not add Electron to Valaxy. The command is included in `1.0.0-rc.16` and later. Until the CMS CLI is published, install the local tarball provided by the CMS repository instead of unrelated similarly named packages.

Missing applications are not downloaded automatically. Opening permits static editing only; installation, preview and builds still require explicit desktop trust. Running tasks prevent project switching.

## Earlier prototypes

[valaxy-admin](https://github.com/valaxyjs/valaxy-admin) is the retired Tauri prototype, retained for historical reference. The Electron prototype formerly developed in this repository is also superseded by the CMS desktop client. This consolidation does not imply that every prototype interaction has a direct replacement today.

Existing blogs stay in their original directories. Save pending edits, close the old application and open the same project in CMS. Keep the old application data until migration is verified; Markdown, assets, configuration and Git history do not need to be recreated.
