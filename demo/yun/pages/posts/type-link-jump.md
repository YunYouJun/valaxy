---
title: 链接跳转测试
date: 2024-10-07 01:59:12
updated: 2024-10-07 01:59:12
tags:
  - 四元数
  - 万向锁
categories:
  - 云游的小笔记
type: yuque
url: https://www.yuque.com/yunyoujun/blog/quaternion-and-spatial-rotation
---

在使用 Babylon 写 [ADV.JS VRM 模型编辑器](https://vrm.advjs.org/) 的人物骨骼旋转动画的时候，我发现几乎所有的骨骼旋转均使用四元数（Quaternion）实现。

于是我便打算好好了解一下相关的内容，但是网上搜到的不少帖子比如 Unity 欧拉角的旋转顺序都是互相矛盾的，导致自己也不知道相信哪个为好，决定还是自己实验下。

同时写了下自己对四元数和万向锁的直观理解，希望能对有兴趣了解这方面的后来者有所帮助。

因为有不少随手的截图和公式，所以就先放在了语雀上。也欢迎随时勘误！

<!-- more -->

---

Q.E.D.
