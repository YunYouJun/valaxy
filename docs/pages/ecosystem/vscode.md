---
title: VS Code Extension
categories:
  - ecosystem
---

[Valaxy for VS Code](https://marketplace.visualstudio.com/items?itemName=yunyoujun.valaxy) adds a post list and a local site preview to your editor. It is an optional companion to a [Valaxy project](/guide/getting-started).

- [Install from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=yunyoujun.valaxy)
- [Source code and contributions](https://github.com/valaxyjs/valaxy-vscode)
- [Report an issue or request a feature](https://github.com/valaxyjs/valaxy-vscode/issues)
- [Release history](https://github.com/valaxyjs/valaxy-vscode/releases)

## Installation

Version **0.1.0** is available as a [VSIX on GitHub Releases](https://github.com/valaxyjs/valaxy-vscode/releases/tag/v0.1.0). It requires **VS Code 1.85 or later**. Until Marketplace publishing is complete, install that VSIX via **Extensions → Install from VSIX…** to use the features described below.

Search for `Valaxy` in the VS Code Extensions view and select the extension published by **YunYouJun** (extension ID: `yunyoujun.valaxy`). You can also install it from a terminal if the `code` command is available:

```bash
code --install-extension yunyoujun.valaxy
```

## Usage

1. Open your blog's root folder in VS Code. Its `package.json` should declare `valaxy` in `dependencies` or `devDependencies`.
2. Start the site's development server with `pnpm dev` in the integrated terminal.
3. Open a Markdown post, then select the Valaxy icon in the activity bar to access **Valaxy Posts** and **Preview**.
4. Select a post to open its source. Use **Valaxy: Preview Refresh** from the command palette if the preview needs refreshing.

The extension provides a post list, file switching, post deletion, and an embedded preview of the running local site. It does not start the development server for you. Each blog in a multi-root workspace is detected independently; article discovery works without a running server.

## Settings

Configure these options in VS Code's workspace settings (`.vscode/settings.json`), not in `valaxy.config.ts`:

| Setting | Default | Description |
| --- | --- | --- |
| `valaxy.enabled` | `false` | Force project detection, including folders without a package manifest. |
| `valaxy.port` | `4859` | Port of the local development server used for preview. |
| `valaxy.postsFolder` | `"pages/posts"` | Directory inside the workspace to scan recursively. |
| `valaxy.serverUrl` | `""` | Optional local HTTP(S) URL including a site base path; overrides `valaxy.port`. |
| `valaxy.confirmDelete` | `true` | Ask for confirmation before moving a post to trash. |

For example, enable deletion confirmation:

```json
{
  "valaxy.confirmDelete": true
}
```

If the server uses another port, set `valaxy.port` to match the URL printed in the terminal and refresh the preview.

## Compatibility and troubleshooting

The extension is maintained in the separate [valaxyjs/valaxy-vscode repository](https://github.com/valaxyjs/valaxy-vscode). Version 0.1.0 is checked against **Valaxy 1.0.0-rc.12**, with real VS Code 1.85 and stable extension-host tests. It does not bundle the Valaxy runtime. Track future work in [the roadmap](https://github.com/valaxyjs/valaxy-vscode/issues/1).

- **The Valaxy view is missing:** use a trusted filesystem workspace. Each blog folder should declare `valaxy`, or set `valaxy.enabled` for that folder. Invalid project configuration is reported in the **Valaxy** output channel.
- **Posts are missing:** check `valaxy.postsFolder`. Missing directories produce an empty list and are rescanned after creation. Markdown files are loaded recursively; hidden and symlinked directories are skipped, and malformed frontmatter is reported without blocking other articles.
- **Preview is unavailable:** start the development server and match its port. For a base path, set `valaxy.serverUrl`, for example `http://localhost:4859/blog/`. Refresh the preview or use **Valaxy: Open Browser Preview**.
- **A custom route does not match:** conventional nested paths, dot nesting and `index.md` are supported. Custom router hooks, dynamic routes and posts outside `pages` require browser navigation. Remote SSH/Containers forwarding remains a manual validation item.

For extension problems, use the [extension issue tracker](https://github.com/valaxyjs/valaxy-vscode/issues) and include your VS Code, extension, and Valaxy versions, reproduction steps, and relevant logs.

## Relationship to DevTools

The extension focuses on native editor file navigation and preview shortcuts. Valaxy DevTools provides visual content, frontmatter, configuration and collection management while the development server runs. Basic extension functionality should remain independent of DevTools. An optional Open DevTools entry is planned after a public discovery and authentication contract is defined; direct integration with private RPC interfaces is not required.
