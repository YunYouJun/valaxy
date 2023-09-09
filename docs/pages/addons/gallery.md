---
title: Valaxy Addons Gallery
title_zh-CN: Valaxy 插件橱窗
categories:
  - Addon
end: false

addons:
  - name: valaxy-addon-algolia
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia
  - name: valaxy-addon-components
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components
    desc: Common Components for Valaxy.
  - name: valaxy-addon-lightgallery
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-lightgallery
    desc: LightGallery for Valaxy.
  - name: valaxy-addon-waline
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-waline
    desc: Waline comment.
  - name: valaxy-addon-twikoo
    repo: https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-twikoo
    desc: Twikoo comment.
---

<AddonGallery :addons="$frontmatter.addons" />
