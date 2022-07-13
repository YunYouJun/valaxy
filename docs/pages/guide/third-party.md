---
title: Third Party
title_zh: 第三方
categories:
  - Docs
  - Guide
end: false
aplayer: true
---

## 音乐播放器

> 基于 [Aplayer](https://github.com/DIYgod/APlayer) 与 [MetingJS](https://github.com/metowolf/MetingJS) 实现

譬如在文章中引入网易云某首歌曲（ID 为歌曲 ID）：

在文章头部添加：

```md
---
aplayer: true
---
```

在文中引入：

```html
<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>
```

效果如下：

<meting-js
 id="22736708"
 server="netease"
 type="song"
 theme="#C20C0C">
</meting-js>

> More info see [Option | MetingJS](https://github.com/metowolf/MetingJS#option)
