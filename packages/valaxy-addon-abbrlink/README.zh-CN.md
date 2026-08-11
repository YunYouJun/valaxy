# valaxy-addon-abbrlink

[English](https://valaxy.site/addons/official/abbrlink) | **简体中文**

使用基于 CRC 的哈希，为 Valaxy 文章生成稳定的短链接。

## 安装

```bash
pnpm add valaxy-addon-abbrlink
```

## 使用

在 `valaxy.config.ts` 中加载插件：

```ts
import { defineValaxyConfig } from 'valaxy'
import { addonAbbrlink } from 'valaxy-addon-abbrlink'

export default defineValaxyConfig({
  addons: [
    addonAbbrlink(),
  ],
})
```
