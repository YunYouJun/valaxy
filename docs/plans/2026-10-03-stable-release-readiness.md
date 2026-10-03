# Stable release preparation — 2026-10-03

The candidate remains **1.0.0-rc.16**. This preparation does not publish 1.0.0, change npm dist-tags, or advertise the optional Yunzhan client as stable.

## Changes

- Refresh compatible dependency resolutions, including the previously vulnerable defu, Rollup and Feishu/protobufjs paths. Align Devframe and its service packages to 1.2.0 so Vite DevTools and the addon use the same RPC type declarations.
- Require Mermaid 12.1.0 in the exported addon dependency range. This upstream release upgrades both parser paths to Chevrotain 13 and removes vulnerable lodash-es copies from installed and bundled dependencies. The two exact release-age exceptions cover this reviewed security release only.
- Run build and unit CI on the declared minimum Node 22.12.0 as well as LTS. Bound Vitest to two workers so TypeDoc subprocesses fit the integration test resource budget. Scaffold projects declare the same minimum, and the Netlify template uses Node 22.
- Export the public DevTools options type to avoid private declaration references in packed consumers.
- Handle missing child paths in the Vue compiler filesystem on Node 22, where `statSync` still throws `ENOTDIR` despite `throwIfNoEntry: false`. Other filesystem errors continue to surface.
- Derive English and Chinese release SEO descriptions from the actual prerelease/stable version state. Release commits use Conventional Commits.
- Correct the Meting migration instructions: inline players use `<MetingJs>` to load scripts. Raw `<meting-js>` tags require MetingJS to have already loaded, such as through a global player.

## Local verification

- Build, lint and typecheck pass. Unit tests: **78 files / 572 tests** pass.
- Official Node 22.12.0 ARM64 download was SHA-256 verified. The demo and independent candidate consumer SSG builds pass on this runtime.
- All **572 unit tests** also pass on Node 22.12.0 with two workers, now the configured default. The unrestricted local worker count overloaded the TypeDoc integration timeout; limiting concurrency preserves every assertion and test timeout.
- Documentation SSG passes with **3502.7 MiB** peak process-tree RSS under the 4 GiB budget. API verification: **295 pages / 4520 internal links**.
- Production navigation E2E: **22/22**, including desktop and mobile documentation routes, search, menus and portals.
- All six coordinated packages were packed with actual catalog and workspace resolution. An isolated consumer installs these tarballs, both themes, the packed Mermaid addon and published Meting 0.2.1. Yun and Press SSG builds pass.
- Browser verification confirms Yun article/tag navigation and Press article navigation, Mermaid rendering and zoom in both themes, and Meting initialization using a synthetic local API response. This checks the addon integration, not an external music service or audio playback.
- After the Mermaid 12.1.0 update, eight Mermaid unit regressions and four production SSG browser tests pass, covering English/Chinese rendering, keyboard zoom and narrow touch layouts in both color schemes. The temporary SSG runner uses the existing Mermaid suite's desktop project and 10-second assertion budget; the original five-second generic SSG budget and inherited mobile project were unsuitable for these tests. Documentation SSG passes again at **3860.7 MiB** peak process-tree RSS. A fresh independent consumer uses pnpm 12 workspace settings for coordinated package overrides and retains only the braces advisory.
- A separate project first installs and builds published **0.28.11**, then upgrades to the packed candidate and migrates `ignoreDeadLinks` to `build.ignoreDeadLinks`. Both Markdown files retain identical SHA-256 hashes, and the old article route is generated on Node 22.12.0. This is a synthetic migration fixture, not a claim that every third-party theme is compatible.

## Remaining release decisions

The production workspace audit fell from **79 advisories (1 Critical)** to **1 High**. The fresh isolated consumer with both optional addons reports the same one: the braces recursion advisory via glob tooling. Mermaid 12.1.0 fixes the former two lodash-es advisories in independent installs as well. The braces advisory has no officially published fix as of this check. No audit ignore or fictional upgrade was added.

The final 1.0.0 version, coordinated package/template bump, release notes and tag must follow a reviewed decision on those remaining dependencies and final committed artifacts. The checks above bind this prerelease candidate, not a future 1.0.0 build.

Download/menu PR [#751](https://github.com/YunYouJun/valaxy/pull/751) was merged after all 14 final checks passed, using the repository's existing administrator merge permission under the user's authorization. Branch protection was not changed. The final production deployment must be checked after the stacked closeout PR is merged. The new domain alias already redirects to the existing CMS download page.

## Evidence

Local logs and artifacts use the `20261003` suffix:

- `/tmp/valaxy-pr753-audit-20261003.json`
- `/tmp/valaxy-pr753-consumer-audit-final-20261003.json`
- `/tmp/valaxy-pr753-mermaid-unit-20261003.log`
- `/tmp/valaxy-pr753-mermaid-ssg-e2e-final-20261003.log`
- `/tmp/valaxy-pr753-docs-build-20261003.log`
- `/tmp/valaxy-stable-closeout-audit-final-20261003.json`
- `/tmp/valaxy-closeout-consumer-audit-20261003.json`
- `/tmp/valaxy-stable-closeout-unit-20261003.log`
- `/tmp/valaxy-closeout-final-lts-unit-20261003.log`
- `/tmp/valaxy-closeout-minimum-node-unit-20261003.log`
- `/tmp/valaxy-stable-closeout-docs-20261003.log`
- `/tmp/valaxy-closeout-production-e2e-20261003.log`
- `/tmp/valaxy-closeout-consumer-yun-complete-20261003.log`
- `/tmp/valaxy-closeout-consumer-press-complete-20261003.log`
- `/tmp/valaxy-closeout-consumer-yun-final-20261003.log`
- `/tmp/valaxy-closeout-consumer-press-final-20261003.log`
- `/tmp/valaxy-old-migration-upgrade-build-20261003.log`
- `/tmp/valaxy-closeout-packed-20261003/`

Primary vulnerability sources: [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [lodash-es template imports](https://github.com/advisories/GHSA-r5fr-rjxr-66jc), [lodash-es object mutation](https://github.com/advisories/GHSA-f23m-r3pf-42rh). Upstream fix: [Mermaid 12.1.0 release](https://github.com/mermaid-js/mermaid/releases/tag/mermaid@12.1.0).
