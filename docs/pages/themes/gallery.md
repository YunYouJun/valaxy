---
title: Valaxy Themes Gallery
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
    repo: https://github.com/valaxyjs/valaxy-theme-gitlink
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
  - name: valaxy-theme-sakura
    icon: i-ri-book-line
    repo: https://github.com/wrxinyue/valaxy-theme-sakura
    desc: A simple, personalized, and cute anime-style blog theme
    siteImage: https://common.s3.bitiful.net/valaxy%2Fvalaxy-theme-sakura.png
    siteExampleUrl: 'https://sakura.wrxinyue.org/'
    tags:
      - blog
      - sakura
      - light
  - name: valaxy-theme-oceanus
    icon: i-ri-book-line
    repo: https://github.com/wrxinyue/valaxy-theme-oceanus
    desc: Simple and elegant Valaxy documentation theme
    siteImage: https://common.s3.bitiful.net/valaxy%2Fvalaxy-theme-oceanus.png
    siteExampleUrl: 'https://oceanus.wrxinyue.org/'
    tags:
      - docs
      - oceanus
  - name: valaxy-theme-antfu
    icon: i-ri-book-line
    repo: https://github.com/wrxinyue/valaxy-theme-antfu
    desc: The Valaxy ported version of antfu.me
    siteImage: https://common.s3.bitiful.net/valaxy%2Fvalaxy-theme-antfu.png
    siteExampleUrl: 'https://antfu.wrxinyue.org/'
    tags:
      - blog
      - antfu
      - dark
---

<ThemeGallery :themes="$frontmatter.themes" />
