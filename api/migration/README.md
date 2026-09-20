# API domain cutover

The content site remains available for rollback until production has switched.

1. Build core packages and the unified site: `pnpm build && pnpm docs:build`.
2. Run `pnpm verify:api`. It checks generated links, fragments and the committed old-page snapshot, then writes `api/migration/dist/_redirects` with individual HTTP 301 mappings. The snapshot was captured from the old production-style build at the recorded revision; compare it with the deployed site's sitemap before cutover.
3. Deploy the main site and verify representative `/api/client/`, `/api/node/` and `/api/types/` pages, search, source links and mobile locale switching.
4. In the Algolia crawler, include `https://valaxy.site/api/**`, extract API headings/content from `main`, and treat API records as shared between `en` and `zh-CN`. The current client applies no language facet filter; preserve that behavior or use an OR with shared records. Re-crawl and verify real queries in both languages.
5. Preview the redirect artifact on the old host. Cloudflare Pages and Netlify accept this `_redirects` syntax; other hosts require equivalent rules. Verify 301 status, Location, query-string forwarding and fragment preservation in a browser. Fragments are not sent to the server; compatibility depends on the target page IDs checked by step 2.
6. Change only the old API project's build command to `pnpm verify:api` if it also has the new docs build artifact, or publish the prevalidated redirect artifact. It should publish `api/migration/dist`, not rebuild TypeDoc or the old VitePress content site. Keep the domain indefinitely.
7. After production checks pass, remove the old API workspace/build scripts and VitePress-only dependencies in a separate cleanup. Do not remove VitePress from Press while its styles/types still depend on it.

Keep the previous API output, main-site deployment and redirect configuration for rollback. A cached 301 may continue sending users to the main site even after rollback, so the main `/api/` URLs must remain available.

No DNS, hosting or Algolia administrative changes are performed by these scripts.
