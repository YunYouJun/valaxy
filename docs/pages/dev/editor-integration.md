---
title: Native editor integration
categories: dev
---

Valaxy's development server exposes a versioned, read-only protocol for native editors such as the [VS Code extension](https://github.com/valaxyjs/valaxy-vscode). Discover support instead of inferring it from a framework version. Older servers do not implement this protocol.

The protocol works with `devtools: false`, requires neither MCP nor DevTools RPC, and is absent from production builds. Editors must not load project configuration themselves.

## Transport and workspace identity

Connect from the **workspace extension host** to the server's loopback HTTP(S) URL, including its Vite base. In Remote SSH and Dev Containers, this request runs remotely beside the server. Apply VS Code's `asExternalUri` only when opening a browser or webview URL.

All requests require `X-Valaxy-Client: 1`. The endpoint requires a loopback socket and a `localhost`, `127.0.0.1` or `[::1]` Host, rejects Origin and Fetch Metadata headers, and removes CORS response headers. It is a native development-host API, not a browser API. The header is not a credential and grants no DevTools access. Native processes on the same host share its trust boundary.

Responses use JSON and `Cache-Control: no-store`. Clients should bound timeouts and response sizes, refuse redirects, and accept advertised paths only on the configured server's origin.

`projectId` is hexadecimal SHA-256 of `realpath(userRoot)` with backslashes replaced by `/`. Compute it in the workspace host before using a server. This detects incorrect ports/workspaces without returning absolute paths; it is **not authentication**. The configured URL's path must also match `base`.

## Discover capabilities

`GET <base>__valaxy__/capabilities`

Example response for `/blog/`:

```json
{
  "protocolVersion": 1,
  "valaxyVersion": "1.0.0",
  "projectId": "<workspace digest>",
  "base": "/blog/",
  "capabilities": {
    "routes": { "version": 1, "resolve": "/blog/__valaxy__/routes" },
    "devtools": {
      "status": "available",
      "path": "/blog/__valaxy_devtools__/",
      "authentication": "browser"
    }
  }
}
```

Protocol and route capability version `1` follow this contract. Ignore unknown fields. Incompatible versions should produce an upgrade message. A missing endpoint or an older server's HTML fallback means unsupported; a stopped server means unavailable. Preserve offline navigation, post creation and conventional preview in both cases.

## Open DevTools

DevTools status is `available`, `disabled` or `unavailable`. Only `available` supplies a path. The plugin advertises its actual mount for both native Vite and standalone hosts, including a custom DevTools base. Do not derive the path yourself.

Open the ordinary URL in the external browser. The browser owns authentication: initially enter the one-time code displayed in the development server's terminal. Incorrect codes remain rejected; authentication can survive reload. The extension never obtains or stores a code, token or authenticated URL, and discovery never contains one. Visual editors remain in DevTools.

## Resolve an article

`POST <advertised routes.resolve>`, with `Content-Type: application/json` and a JSON body of at most 8 KiB:

```json
{
  "projectId": "<matching workspace digest>",
  "file": "content/articles/hello.md"
}
```

`file` is a workspace-relative Markdown path using `/`, without absolute paths, backslashes, empty segments, `.` or `..`. Its real target must stay inside the workspace. Custom content directories are supported when included in the actual router's source tree. Draft, hidden and protected articles are eligible for author preview; responses exclude bodies, frontmatter, credentials and source paths.

```json
{
  "status": "resolved",
  "routes": [
    { "path": "/stories/hello", "dynamic": false },
    { "path": "/archive/:slug", "dynamic": true }
  ]
}
```

Results use a snapshot of the **actual final development route tree**, after framework and configured router hooks. Queries never rerun configuration, Markdown processing or hooks. Snapshots follow additions, changes and deletions. Canonical source paths support symlinked workspace roots while rejecting targets outside the workspace.

`path` excludes the Vite base and preserves Vue Router's filename encoding. Preserve existing percent escapes when joining the base; do not double-encode filenames. Aliases are not separate canonical candidates. Client-side `router.addRoute()` mutations and dynamic parameter values are outside this protocol.

| Result | Client behavior |
| --- | --- |
| One static route | Open automatically. |
| Multiple static routes | Offer explicit selection; automatic following must not choose arbitrarily. |
| Dynamic routes only | Keep the preview, explain that parameters are needed, and offer manual browser navigation. |
| `not-found`, empty routes | Explain that no route exists; do not silently substitute a guessed URL. |
| HTTP 503, `pending` | Initialization or asynchronous route editing is in progress. Retry briefly, then preserve the preview with a refresh instruction. |

Wrong workspace identity returns HTTP 409. Invalid input returns 400, rejected access 403, unsupported methods 405, and non-JSON route requests 415. Error responses have a short `error` code and exclude internal exceptions.
