---
title: Valaxy Themes Gallery
title_zh: Valaxy 主题橱窗
categories:
  - Theme
end: false

themes:
  - name: valaxy-theme-yun
    repo: YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun
    desc: Default Theme for Valaxy
    # todo
    # preview:
    tags:
      - yun
      - light

  - name: valaxy-theme-press
    repo: YunYouJun/valaxy/tree/main/packages/valaxy-theme-press
    desc: Docs Theme for Valaxy
    # todo
    # preview:
    tags:
      - docs
      - press
---

::: zh-CN
欢迎 [提交主题](https://github.com/YunYouJun/valaxy/blob/main/docs/pages/themes/gallery.md)。
:::

::: en
Feel free to [submit your theme](https://github.com/YunYouJun/valaxy/blob/main/docs/pages/themes/gallery.md).
:::

<ThemeGallery :themes="frontmatter.themes" />
<br />
