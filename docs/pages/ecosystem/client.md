---
title:
  en: Client
  zh-CN: 客户端
categories:
  - ecosystem
---

The Valaxy writing client is being consolidated into **[Yunle CMS (云栈)](https://cms.yunle.fun)**. CMS provides one shared editor for Web and desktop, with mobile planned next. Valaxy continues to maintain its framework, CLI, themes and DevTools independently; using CMS is optional.

## Availability

The CMS Web entry is available. The Electron desktop client is a development preview, with local macOS arm64 verification. Signed desktop downloads, Windows/Linux installation verification, desktop cloud sync and the mobile app are still pending. The Web entry is not a desktop download link.

## Desktop preview

The preview can open or create local Valaxy blogs, edit Markdown and fields without login, recover drafts, run a real theme preview and build static output using a managed runtime. Project code only runs after an explicit local trust action. The project's DevTools remains available for configuration and development tools.

Media management, a dedicated metadata table and directory tree, per-article preview routes, local Git operations and complete configuration adaptation remain on the CMS roadmap. Real-account desktop publishing and signed distribution require further verification.

## Open from a terminal

With the desktop app and the separate `@yunlefun/cms-cli` installed:

```bash
yunzhan app .
yunzhan app /path/to/blog
yunzhan doctor
```

This repository adds `valaxy app [path]` as an optional thin forwarder to the installed `yunzhan` command. It never loads project config or addon commands, and does not add Electron to Valaxy. The already published `1.0.0-rc.15` does not include this command; use a version containing this change. Until the CMS CLI is published, install the local tarball provided by the CMS repository instead of unrelated similarly named packages.

Missing applications are not downloaded automatically. Opening permits static editing only; installation, preview and builds still require explicit desktop trust. Running tasks prevent project switching.

## Earlier prototypes

[valaxy-admin](https://github.com/valaxyjs/valaxy-admin) is the retired Tauri prototype, retained for historical reference. The Electron prototype formerly developed in this repository is also superseded by the CMS desktop client. This consolidation does not imply that every prototype interaction has a direct replacement today.

Existing blogs stay in their original directories. Save pending edits, close the old application and open the same project in CMS. Keep the old application data until migration is verified; Markdown, assets, configuration and Git history do not need to be recreated.
