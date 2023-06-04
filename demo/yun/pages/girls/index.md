---
title: Lovely Girls
date: 2019-01-07 11:17:35
updated: 2019-01-07 11:17:35
icon: i-ri-women-line
girls:
  - name: C.C.
    anilist_id: 1111
    douban_id: 2043155
    from: CODE GEASS
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b1111-hNdvOW5ZNCCH.png
  - name: 黑雪姬
    anilist_id: 46305
    douban_id: 6869375
    from: 加速世界
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b46305-CiZOEqz5u1mk.png
# You also can pass a json link.
# girls: https://wives.yunyoujun.cn/girls.json
random: false
excerpt: 一些我喜欢的可爱女孩子
---

<div class="text-center" m="2" title="我全都要！">
!大家都是我的天使!
</div>

<YunGirls :girls="frontmatter.girls" :random="frontmatter.random" />

示例：

```yaml
title: Lovely Girls
date: 2019-01-07 11:17:35
updated: 2019-01-07 11:17:35
icon: i-ri-women-line
girls:
  - name: C.C.
    anilist_id: 1111
    douban_id: 2043155
    from: CODE GEASS
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b1111-hNdvOW5ZNCCH.png
  - name: 黑雪姬
    anilist_id: 46305
    douban_id: 6869375
    from: 加速世界
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b46305-CiZOEqz5u1mk.png
random: false
```

- `name`: 人物名称
- `avatar`: 头像 （不存在时，依次默认使用 anilist、立绘）
- `from`: 出自的作品
- `reason`: 喜欢的原因
