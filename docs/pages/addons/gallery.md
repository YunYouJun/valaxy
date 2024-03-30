---
title: Valaxy Addons Gallery
title_zh: Valaxy 插件橱窗
categories:
  - addon
end: false

addons:
  - name: valaxy-addon-algolia
    icon: i-ri-search-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia
    desc: Algolia Search.
    desc_zh: Algolia 搜索
    tags:
      - search
  - name: valaxy-addon-components
    icon: i-ri-apps-2-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components
    desc: Common Components for Valaxy.
    desc_zh: Valaxy 的通用组件
    tags:
      - component
  - name: valaxy-addon-lightgallery
    icon: i-ri-image-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-lightgallery
    desc: LightGallery for Valaxy.
    desc_zh: Valaxy 的 LightGallery
    tags:
      - image
  - name: valaxy-addon-waline
    icon: i-ri-chat-3-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-waline
    desc: Waline comment.
    desc_zh: Waline 评论系统
    tags:
      - comment
  - name: valaxy-addon-twikoo
    icon: i-ri-chat-3-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-twikoo
    desc: Twikoo comment.
    desc_zh: Twikoo 评论系统
    tags:
      - comment
  - name: valaxy-addon-bangumi
    icon: i-ri-film-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-bangumi
    desc: Display bilibili or bangumi watching list.
    desc_zh: 展示 bilibili 或 bangumi 追番列表
    tags:
      - video
  - name: valaxy-addon-meting
    icon: i-ri-music-2-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-meting
    desc: Global music player based on APlayer and MetingJS.
    desc_zh: 基于 APlayer 和 MetingJS 的全局音乐播放器
    tags:
      - music
  - name: valaxy-addon-live2d
    icon: i-ri-magic-line
    repo: https://github.com/valaxyjs/valaxy-addon-live2d
    desc: Cute live2d mascot component.
    desc_zh: 萌萌哒 live2d 看板娘组件
    tags:
      - magic
---

<AddonGallery :addons="$frontmatter.addons" />
