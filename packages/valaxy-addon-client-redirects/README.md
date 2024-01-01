# valaxy-addon-client-redirects

Client Redirects for [valaxy](https://valaxy.site).

Refrence [docusaurus plugin-client-redirects](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-client-redirects)

This plugin will write additional HTML pages to your static site that redirect the user to your existing Valaxy pages with JavaScript.

**Note:** This addon only works in production. And It is better to use server-side redirects whenever possible.

## Install

```bash
npm i -D valaxy-addon-client-redirects
# pnpm add -D valaxy-addon-client-redirects
```

## Configuration

| Option    | Type           |Default| Description |
|   :-:     |       :-:      |  :-:   |         :-:                 |
| redirects | RedirectRule[] |  []   |  The list of redirect rules. |

### Types

RedirectRule

```ts
interface RedirectRule {
  to: string
  from: string | string[]
}
```

### Example configuration

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonClientRedirects } from 'valaxy-addon-client-redirects'

export default defineValaxyConfig({
  addons: [
    addonClientRedirects({
      redirects: [
        {
          from: '/aaa',
          to: '/posts/foo'
        },
        {
          from: ['/222', '/111/'],
          to: '/posts/bar'
        },
        {
          from: '/',
          to: '/posts/bar'
        }
      ]
    })
  ],
})
```
