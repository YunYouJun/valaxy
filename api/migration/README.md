# Legacy API domain

`api.valaxy.site` permanently redirects to the shared API reference at <https://valaxy.site/api/>. The old VitePress content build has been retired after production verification. Keep the domain, snapshot and mapper indefinitely.

## Build and verification

- Main site: `pnpm build && pnpm docs:build && pnpm verify:api` checks generated links, canonical URLs and every preserved legacy anchor.
- Old domain: `node scripts/build-api-redirects.mjs` writes `api/migration/dist/_redirects` without installing dependencies or running TypeDoc.
- Cloudflare Pages project `valaxy-api`: build command `node scripts/build-api-redirects.mjs`, output `api/migration/dist`, and `SKIP_DEPENDENCY_INSTALL=true` in both production and preview.
- Preview any mapping change first. Verify HTTP 301 and `Location`, query forwarding and a real browser navigation with a fragment before deploying production. Fragments are not sent to the server, so target IDs must remain compatible.

The snapshot covers 292 legacy pages and 2,168 anchors. The mapper produces 603 rules, including extensionless and old index aliases. The final live crawl followed 578 HTML URLs; the old site had no sitemap. It includes `loadAllContent`, added by the migration release. Both preview and production were checked against the actual host on 2026-09-21.

## Search

Algolia uses `https://valaxy.site/sitemap.xml`. Extract headings from `main article h1` through `h6`, falling back to `head > title` only when an article has no h1. Extract ordinary content from `main article p, main article li`; include `td` and `pre` for `/api/` pages. Give shared API records `lang: ['en', 'zh-CN']`, and authored pages their document language. Do not include sidebar/navigation headings or generic whole-page selectors.

The clean production crawl processed 490 pages (19 URLs ignored) and published about 6,770 records. Production English/Chinese API and Chinese documentation queries were verified. Keep the crawler's normal safe-reindex threshold; the one-time reduction came from removing duplicated navigation content.

## Rollback

- Last standalone API content deployment: `06ba6b75-baf8-468c-a947-403c08a08562` at source `7528c1afa2f1eb06ea2cf17aa8c33f77455688b3`.
- First production redirect deployment: `3da62906-f415-450b-a936-637bb3a18053` at source `a572916b42ecd1c7232fe8d6d12d94b78f7e7207`.
- Main site before migration: `5914a24d-fa44-4dc3-b841-adba19477bdd`; first unified production deployment: `bbd60e4b-1ecd-4c40-aedf-decbdb367d54`.
- Algolia index and settings backup: `valaxysite-before-api-cleanup-20260921`. In Manage index → Duplicate, copy that backup to the existing `valaxysite` index to restore it.

Use Cloudflare Pages deployment rollback to restore an existing artifact. To rebuild standalone content, use the recorded historical commit and its old command `npm run build:valaxy && npm run api:build`, output `api/.vitepress/dist`, with dependency installation enabled. Current source intentionally no longer contains that workspace.

A cached permanent redirect may continue sending users to the main site after rollback. Keep the new `/api/` URLs available even if old-domain content is restored. These scripts do not change DNS or hosting settings themselves.
