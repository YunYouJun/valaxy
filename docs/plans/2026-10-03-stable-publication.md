# Valaxy 1.0.0 publication preparation

The public npm version is still `1.0.0-rc.16`. This document prepares a stable release; it does not announce one.

## Fixed publication defects

- Version preparation updates the six coordinated packages, the blog scaffold and the pnpm lockfile without staging unrelated work, committing, tagging or pushing.
- A separate `pnpm release --publish` operates only on a clean, reviewed `main` matching `origin/main`. It checks the exact version, rejects an existing tag and pushes only that tag with the reviewed commit in one atomic operation.
- Errors now exit unsuccessfully. Both pnpm's JavaScript CLI and pnpm 12's native executable are supported.
- `check:release` validates package, scaffold and tag versions, then runs lint, all package and demo builds, type checking, units and the production High/Critical dependency audit. The tag workflow repeats these checks before npm publication.
- The Press scaffold now selects the same version as Valaxy. Independently versioned third-party themes continue to use their own latest channel. The blog scaffold explicitly installs the core Vue peers, so it also works when pnpm peer auto-installation is disabled; preparation keeps those ranges synchronized.

- The fresh Press scaffold now has a valid example site URL. Its first SSG build previously failed in sitemap generation because the hostname was empty; replace the example URL with the deployed URL before publishing.

## Publication sequence

```sh
pnpm release --prepare 1.0.0
pnpm check:release
# Review and merge the version/template/lockfile changes.
# From a clean, current main:
pnpm release --publish
```

Do not create or push `v1.0.0` until the release check succeeds. After the tag workflow completes, verify that all six npm packages and their latest tags report `1.0.0`, create fresh Yun and Press projects using the public registry, and verify the generated sites before announcing the release. Optional addons have independent versions and their own publication workflows.

## Remaining upstream dependency

On 2026-10-03, npm still publishes `braces@3.0.3`; [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched version. The [upstream depth-limit fix](https://github.com/micromatch/braces/pull/72) remains open. It affects recursive AST walks when given deeply nested brace patterns.

Valaxy obtains braces through fast-glob/micromatch and the component/layout/i18n build plugins. Core discovery normally uses fixed Markdown globs; custom include patterns and plugin options come from locally executed project configuration. The read-only MCP list/search tools use fixed globs, and search text is compared literally rather than passed to a glob parser. Generated static pages do not run these Node discovery tools. This scopes the exposure but does not repair the dependency or clear its audit finding.

The workspace and an independently installed packed consumer must both clear this finding through a real published dependency fix or removal. A workspace-only override, audit ignore or renamed version would not establish that consumers receive a fix.

## Draft announcement

Valaxy 1.0 brings Vue 3 and Vite 8, a single built-in SSG engine, the Yun and Press themes, and the refreshed editor/devtools workflow. Node.js 22.12.0 or newer is required. Upgrade Valaxy and its official theme together. Mermaid diagrams and Meting music players are optional addons; enable the relevant addon if the site uses them. See the [Chinese migration guide](../pages/zh/migration/version.md) and [English migration guide](../pages/migration/version.md) for removed options and SSR compatibility.

The Yunzhan desktop download is a separate public preview release and is not part of Valaxy's stable-version guarantee.
