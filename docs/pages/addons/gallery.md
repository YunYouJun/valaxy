---
title: Valaxy Addons Gallery
title_zh-CN: Valaxy 插件橱窗
categories:
  - Addon
end: false

addons:
  - name: valaxy-addon-algolia
    icon: i-ri-search-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia
    desc: Algolia Search.
    tags:
      - search
  - name: valaxy-addon-components
    icon: i-ri-apps-2-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components
    desc: Common Components for Valaxy.
    tags:
      - component
  - name: valaxy-addon-lightgallery
    icon: i-ri-image-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-lightgallery
    desc: LightGallery for Valaxy.
    tags:
      - image
  - name: valaxy-addon-waline
    icon: i-ri-chat-3-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-waline
    desc: Waline comment.
    tags:
      - comment
  - name: valaxy-addon-twikoo
    icon: i-ri-chat-3-line
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-twikoo
    desc: Twikoo comment.
    tags:
      - comment
---

<AddonGallery :addons="$frontmatter.addons" />
