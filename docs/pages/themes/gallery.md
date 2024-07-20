---
title: Valaxy Themes Gallery
title_zh: Valaxy 主题橱窗
categories:
  - theme
end: false

themes:
  - name: valaxy-theme-yun
    icon: i-ri-cloud-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun
    desc: Default Theme for Valaxy
    siteImage: https://s2.loli.net/2023/05/05/QoK4ZimqN3fgRdD.png
    siteExampleUrl:  https://www.yunyoujun.cn
    tags:
      - yun
      - light
  - name: valaxy-theme-press
    icon: i-ri-book-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press
    desc: Docs Theme for Valaxy
    siteImage: https://s2.loli.net/2023/05/05/1DyEudpohIl47cP.png
    siteExampleUrl: 'https://valaxy.site/'
    tags:
      - docs
      - press
  - name: valaxy-theme-starter
    icon: i-ri-book-line
    repo: https://github.com/valaxyjs/valaxy-theme-starter
    desc: Starter Theme for Valaxy
    siteImage: https://s2.loli.net/2023/10/06/viHCdNlQn2KZzEq.png
    siteExampleUrl: 'https://starter.valaxy.site/'
    tags:
      - starter
      - template
  - name: valaxy-theme-gitlink
    icon: i-ri-book-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press
    desc: GitLink Theme for Valaxy
    siteImage: https://s2.loli.net/2023/10/06/xJf8nHBQNFybpag.png
    siteExampleUrl: 'https://gitlink.valaxy.site/'
    tags:
      - home
      - gitlink
  - name: valaxy-theme-hairy
    icon: i-ri-book-line
    repo: https://github.com/hairyf/valaxy-theme-hairy
    desc: Hairy theme for valaxy
    siteImage: https://raw.githubusercontent.com/hairyf/valaxy-theme-hairy/main/public/preview.png
    siteExampleUrl: 'https://www.hairy.blog/'
    tags:
      - hairy
      - blog
---
::: zh-CN
::: tip

很高兴你看到这里，这里是 Valaxy 主题橱窗，我将会为提交主题（符合基础使用质量）的前五位作者赠送[「小云立牌」](https://twitter.com/YunYouJun/status/1633116052174299137) :P。

欢迎 [提交主题](https://github.com/YunYouJun/valaxy/blob/main/docs/pages/themes/gallery.md)。
:::

::: en
::: tip
Nice to see you here. This is the Valaxy Themes Gallery, and I will give away [「小云立牌」](https://twitter.com/YunYouJun/status/1633116052174299137) to the top five authors who submitted the theme (meeting the basic usage quality) :P.

Feel free to [submit your theme](https://github.com/YunYouJun/valaxy/blob/main/docs/pages/themes/gallery.md).
:::

<ThemeGallery :themes="$frontmatter.themes" />
<br />
