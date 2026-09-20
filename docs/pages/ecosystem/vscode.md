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

Search for `Valaxy` in the VS Code Extensions view and select the extension published by **YunYouJun** (extension ID: `yunyoujun.valaxy`). You can also install it from a terminal if the `code` command is available:

```bash
code --install-extension yunyoujun.valaxy
```

## Usage

1. Open your blog's root folder in VS Code. Its `package.json` should declare `valaxy` in `dependencies` or `devDependencies`.
2. Start the site's development server with `pnpm dev` in the integrated terminal.
3. Open a Markdown post, then select the Valaxy icon in the activity bar to access **Valaxy Posts** and **Preview**.
4. Select a post to open its source. Use **Valaxy: Preview Refresh** from the command palette if the preview needs refreshing.

The extension provides a post list, file switching, post deletion, and an embedded preview of the running local site. It does not start the development server for you.

## Settings

Configure these options in VS Code's workspace settings (`.vscode/settings.json`), not in `valaxy.config.ts`:

| Setting | Default | Description |
| --- | --- | --- |
| `valaxy.enabled` | `false` | Force activation when dependency detection does not enable the extension. |
| `valaxy.port` | `4859` | Port of the local development server used for preview. |
| `valaxy.postsFolder` | `"pages/posts"` | Post directory relative to the workspace root. |
| `valaxy.confirmDelete` | `false` | Ask for confirmation before deleting a post. |

For example, enable deletion confirmation:

```json
{
  "valaxy.confirmDelete": true
}
```

If the server uses another port, set `valaxy.port` to match the URL printed in the terminal and refresh the preview.

## Compatibility and troubleshooting

The extension is maintained in the separate [valaxyjs/valaxy-vscode repository](https://github.com/valaxyjs/valaxy-vscode). The latest published GitHub release is **0.0.8**, with a VS Code requirement of **1.77.0 or later**. Its development dependencies still target Valaxy 0.14; the published version has not been verified against Valaxy 1.x here.

[The 0.1.0 compatibility PR](https://github.com/valaxyjs/valaxy-vscode/pull/3) adds multi-root workspaces, recursive scanning, improved preview routing and automated checks against Valaxy 1.0.0-rc.12. These changes are awaiting review and release; the setup and limitations on this page describe 0.0.8. Track progress in [the roadmap](https://github.com/valaxyjs/valaxy-vscode/issues/1).

- **The Valaxy view is missing:** open the blog root directly. The current implementation checks only the first workspace folder and requires a `package.json`, even with `valaxy.enabled` enabled. Reload the VS Code window after changing the project setup.
- **Posts are missing:** ensure `valaxy.postsFolder` exists. The initial scan reads `.md` files directly in that folder; it does not recursively load existing subfolders.
- **Preview is unavailable:** ensure the development server is running and the port matches. Open a Markdown post and refresh the preview. You can also view the site directly in your browser.

For extension problems, use the [extension issue tracker](https://github.com/valaxyjs/valaxy-vscode/issues) and include your VS Code, extension, and Valaxy versions, reproduction steps, and relevant logs.

## Relationship to DevTools

The extension focuses on native editor file navigation and preview shortcuts. Valaxy DevTools provides visual content, frontmatter, configuration and collection management while the development server runs. Basic extension functionality should remain independent of DevTools. An optional Open DevTools entry is planned after a public discovery and authentication contract is defined; direct integration with private RPC interfaces is not required.
