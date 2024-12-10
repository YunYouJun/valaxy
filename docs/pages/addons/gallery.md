---
title: Valaxy Addons Gallery
title_zh: Valaxy 插件橱窗
categories:
  - addon
end: false

addons:
  - name: valaxy-addon-algolia
    author: YunYouJun
    icon: i-ri-search-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia
    desc: Algolia Search.
    desc_zh: Algolia 搜索
    tags:
      - search
  - name: valaxy-addon-components
    author: YunYouJun
    icon: i-ri-apps-2-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components
    desc: Common Components for Valaxy.
    desc_zh: Valaxy 的通用组件
    tags:
      - component
  - name: valaxy-addon-lightgallery
    author: YunYouJun
    icon: i-ri-image-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-lightgallery
    desc: LightGallery for Valaxy.
    desc_zh: Valaxy 的 LightGallery
    tags:
      - image
  - name: valaxy-addon-waline
    author: YunYouJun
    icon: i-ri-chat-3-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-waline
    desc: Waline comment.
    desc_zh: Waline 评论系统
    tags:
      - comment
  - name: valaxy-addon-twikoo
    author: YunYouJun
    icon: i-ri-chat-3-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-twikoo
    desc: Twikoo comment.
    desc_zh: Twikoo 评论系统
    tags:
      - comment
  - name: valaxy-addon-bangumi
    author:
      - yixiaojiu
      - YunYouJun
    icon: i-ri-film-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-bangumi
    desc: Display bilibili or bangumi watching list.
    desc_zh: 展示 bilibili 或 bangumi 追番列表
    tags:
      - video
  - name: valaxy-addon-meting
    author:
      - YunYouJun
      - yixiaojiu
    icon: i-ri-music-2-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-meting
    desc: Global music player based on APlayer and MetingJS.
    desc_zh: 基于 APlayer 和 MetingJS 的全局音乐播放器
    tags:
      - music
  - name: valaxy-addon-live2d
    author: WRXinYue
    icon: i-ri-magic-line
    repo: https://github.com/valaxyjs/valaxy-addon-live2d
    desc: Cute live2d mascot component.
    desc_zh: 萌萌哒 live2d 看板娘组件
    tags:
      - magic
  - name: valaxy-addon-git-log
    author: WRXinYue
    icon: i-ri-git-pull-request-line
    repo: https://github.com/valaxyjs/valaxy-addon-git-log
    desc: Integrates git logs into your page of Valaxy site.
    desc_zh: 将 Git 日志集成到你的 Valaxy 网站页面中
    tags:
      - git-log
  - name: valaxy-addon-hitokoto
    author: WRXinYue
    icon: i-ri-chat-quote-line
    repo: https://github.com/valaxyjs/valaxy-addon-hitokoto
    desc: Hitokoto Composition API for Valaxy.
    desc_zh: 将一言（Hitokoto）API 集成于 Valaxy
    tags:
      - hitokoto
  - name: valaxy-addon-vercount
    author: WRXinYue
    icon: i-ri-eye-line
    repo: https://github.com/valaxyjs/valaxy-addon-vercount
    desc: A Vercount API based counting plugin for Valaxy, serving as an alternative to Busuanzi counting.
    desc_zh: 基于 Vercount API 实现的 Valaxy 计数插件, 用于不蒜子计数替代方案
    tags:
      - busuanzi
      - vercount
  - name: valaxy-addon-face
    author: qtqz
    icon: i-ri-emoji-sticker-line
    repo: 'https://github.com/qtqz/my-valaxy-addons/tree/main/valaxy-addon-face'
    desc: Use stickers in articles.
    desc_zh: 在文章中使用表情包
    tags:
      - emoji
      - sticker
---

<AddonGallery :addons="$frontmatter.addons" />
