# valaxy-addon-image

Support image group browsing, and more properties

```ts
import { defineConfig } from 'valaxy'
export default defineConfig({
  addons: [
    'valaxy-addon-image'
  ]
})
```

## Use alone

```md
## image

<Image fit="cover" style="width: 100px; height: 100px" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" />

```
## Image group

Use group click on image to pop up preview overlay

```md
## images

<ImageGroup gap="12" row="120px">
  <Image src="https://tva2.sinaimg.cn/large/6833939bly1gicitcxhpij20zk0m8hdt.jpg" />
  <Image src="https://tva2.sinaimg.cn/large/6833939bly1gicitf0kl1j20zk0m87fe.jpg" />
  <Image src="https://tva2.sinaimg.cn/large/6833939bly1gicitht3xtj20zk0m8k5v.jpg" />
  <Image src="https://tva2.sinaimg.cn/large/6833939bly1gicitspjpbj20zk0m81ky.jpg" />
  <Image src="https://tva2.sinaimg.cn/large/6833939bly1gicitzannuj20zk0m8b29.jpg" />
  <Image src="https://tva2.sinaimg.cn/large/6833939bly1giciub8ja1j20zk0m81ky.jpg" />
  <Image src="https://tva2.sinaimg.cn/large/6833939bly1giciuja1j1j20zk0m8kjl.jpg" />
</ImageGroup>

```

click on image

![image](https://link.jscdn.cn/sharepoint/aHR0cHM6Ly8xZHJpdi1teS5zaGFyZXBvaW50LmNvbS86aTovZy9wZXJzb25hbC9zdG9yXzFkcml2X29ubWljcm9zb2Z0X2NvbS9FUXFvWmNOb0VEcFBoXzl6emtoS01NQUJrVTh6OHJqUG1RX3lfMFdmbm04YU1R.png)

## ImageGroup Attributes

- row(`number/string`) row width
- col(`number/string`) col height
- gap(`number/string`) spacing
- justify   (`string`) [justify-content](https://developer.mozilla.org/zh-CN/docs/Web/CSS/justify-content) shorthand
- align     (`string`) [align-items](https://developer.mozilla.org/zh-CN/docs/Web/CSS/align-items) shorthand

## Image Attributes

you can [element-plus/image](https://element-plus.gitee.io/en-US/component/image.html#image)

## Thanks

💗 The implementation of valaxy-addon-image is based on or refer the following projects:

- [ElementPlus](https://github.com/element-plus/element-plus)
- [UnoverlayVue](hhttps://github.com/TuiMao233/unoverlay-vue)
- [Vue](https://github.com/vuejs/core)
