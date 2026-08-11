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
    reason: 冷静、神秘，又有自己的温柔。
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b1111-hNdvOW5ZNCCH.png
  - name: 黑雪姬
    anilist_id: 46305
    douban_id: 6869375
    from: 加速世界
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b46305-CiZOEqz5u1mk.png
  - name: 仓岛千百合
    from: 加速世界
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b49635-lDQ1nWr4gBRX.png
  - name: 筒隐月子
    from: 变态王子与不笑猫
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/n42469-shq7IzxyJNbJ.jpg
  - name: 小豆梓
    from: 变态王子与不笑猫
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/52819.jpg
  - name: 明石
    from: 四叠半神话大系
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b31522-Nkfqv7px3MAv.png
  - name: 松前绪花
    from: 花开伊吕波
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b36184-ylcMtZPMm1cB.png
  - name: 阿库娅
    from: 为美好的世界献上祝福！
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b89362-ibkc0eoECaW1.png
  - name: 惠惠
    from: 为美好的世界献上祝福！
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b89361-tq8PQQ4MmF0M.png
  - name: 满舰饰真子
    from: KILL la KILL
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b87511-T8lwlQKd6SoK.png
  - name: 北白川玉子
    from: 玉子市场
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b74850-D8ksLbb9p9cw.png
  - name: 赫萝
    from: 狼与香辛料
    avatar: https://s4.anilist.co/file/anilistcdn/character/medium/b7373-1BH0gELuZmHD.jpg
# You also can pass a json link.
# girls: https://wives.yunyoujun.cn/girls.json
random: false
excerpt: 一些我喜欢的可爱女孩子
aside: false
---

<div class="text-center" m="2" title="我全都要！">
!大家都是我的天使!
</div>

<ValaxyGirls :girls="frontmatter.girls" :random="frontmatter.random" layout="bubbles" switchable>
  <template #header="{ count, isLoading }">
    <div class="mb-3 flex items-center justify-between gap-3 border-b border-[var(--va-c-divider)] border-solid pb-2">
      <div class="flex items-baseline gap-2">
        <h2 class="m-0 text-xl">心动角色名册</h2>
        <p class="m-0 hidden text-[0.6rem] tracking-widest uppercase op-45 sm:block">Lovely girls archive</p>
      </div>
      <span v-if="!isLoading" class="whitespace-nowrap text-xs op-55">{{ count }} 位</span>
    </div>
  </template>
</ValaxyGirls>

## 100+ 位完整数据示例

下方直接读取完整角色数据源，并提供“渐进展示 / 全部展示”切换。渐进模式会随滚动自动追加并保持首屏轻量；全部模式用于验证一百多个条目同时展示的场景，未进入视口的头像仍由浏览器懒加载。

<GirlsLargeDemo />

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
    reason: 冷静、神秘，又有自己的温柔。
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

备注默认隐藏。通过 `reason-mode="inline"` 始终显示，或使用 `reason-mode="hover"` 在鼠标悬浮、键盘聚焦时显示。

通过 `layout="grid | bubbles | orbit"` 设置默认布局；添加 `switchable` 后，访客可以在三种布局之间自由切换。

`bubbles` 会把完整名册聚合为一个圆球星团，不再生成额外列表；悬浮或聚焦头像时会显示角色名与出自作品。
