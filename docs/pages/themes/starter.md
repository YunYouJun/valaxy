---
title: Theme Starter
---

# Theme Starter

[valaxy-theme-starter](https://github.com/valaxyjs/valaxy-theme-starter) provides three pnpm workspaces:

| Workspace | Purpose |
| --- | --- |
| `theme/` | The published theme package |
| `demo/` | A real site using the theme |
| `docs/` | Theme-specific guides using `valaxy-theme-press` |

Run `pnpm theme:init` to rename the template, `pnpm demo` to develop the theme, and `pnpm docs:dev` to write its documentation. `pnpm build:site` assembles the demo at `/` and documentation at `/docs/` for one static deployment. Adjust the documentation base for a different hosting path.

Keep common [theme development concepts](/themes/write), Valaxy configuration and shared [API references](/api/) here on the official site. Maintain theme-specific configuration, components, examples and upgrade notes next to the theme source. A change to a theme feature should update its documentation in the same pull request.

Press is the default documentation theme for new Valaxy themes. The demo continues to use the theme being developed. An existing VitePress documentation site can remain until there is a concrete benefit to migrating; new templates need only the Valaxy toolchain.

See the [Starter repository documentation](https://github.com/valaxyjs/valaxy-theme-starter/tree/main/docs) for the template's guides and deployment configuration.
