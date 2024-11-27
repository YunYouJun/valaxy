---
title: Code Block Test
categories:
  - Test
---

```dockerfile
FROM ubuntu

ENV PATH /opt/conda/bin:$PATH
```

```bash
ffmpeg -i input.avi -b:v 64k -bufsize 64k output.mp4
```

```ts
import type { ThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

const safelist = [
  'i-ri-home-line',
]

export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts or write in siteConfig
  // siteConfig: {},

  theme: 'yun',
  themeConfig: {

    banner: {
      enable: true,
      title: '云游君的小站',
    },

    notice: {
      enable: true,
      content: '公告测试',
    },
  },

  unocss: {
    safelist,
  },
})
```

```css
:root {
  --va-code-line-height: 1.7;
  --va-code-font-size: 0.875em;

  --va-code-block-color: var(--va-c-text-2);
  --va-code-block-bg: var(--va-c-bg-alt);
  --va-code-block-divider-color: var(--va-c-gutter);

  --va-code-lang-color: var(--va-c-text-3);

  --va-code-line-highlight-color: rgba(0, 0, 0, 0.5);
  --va-code-line-number-color: var(--va-c-text-dark-3);

  // copy
  --va-code-copy-code-border-color: var(--va-c-divider);
  --va-code-copy-code-bg: var(--va-c-bg-soft);
  --va-code-copy-code-hover-border-color: var(--va-c-divider);
  --va-code-copy-code-hover-bg: var(--va-c-bg);
  --va-code-copy-code-active-text: var(--va-c-text-2);
  --va-code-copy-copied-text-content: 'Copied';
}
```
