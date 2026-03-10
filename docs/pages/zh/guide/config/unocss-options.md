---
title: UnoCSS 配置
categories:
  - config
end: false
---

我们默认集成了 [UnoCSS](https://unocss.dev) 以下 presets 预设。

- [`presetWind4`](https://unocss.dev/presets/wind4): 一些常用按需生成的样式，TailwindCSS v4 风格。
- [`presetAttributify`](https://unocss.dev/presets/attributify): 使用属性选择器替代类名。
- [`presetIcons`](https://unocss.dev/presets/icons): 集成了 [icones](https://icones.netlify.app/) 图标库，按需使用。
- [`presetTypography`](https://unocss.dev/presets/typography): 排版相关的样式预设。

因此，你可以直接在 Markdown 中快速实现各式各样的效果。

见 [UnoCSS | Markdown](/zh/guide/markdown#unocss)。


## unocss {#unocss}

您可以在主题 theme 目录的 `uno.config.ts` 或 `unocss.config.ts` 文件中编写 UnoCSS 配置。

```ts [uno.config.ts]
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: [
    [
      'custom-uno-btn',
      'px-4 py-1 rounded inline-block bg-teal-700 text-white cursor-pointer !outline-none hover:bg-teal-800 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'
    ],
  ],
  safelist: ['bg-red-500'],
})
```

也可以在 `valaxy.config.ts` 文件的 `unocss` 配置项中进行配置。以下是 `valaxy.config.ts` 中 `unocss` 配置项的示例:


```ts [valaxy.config.ts]
import { presetIcons } from 'unocss'

export default defineValaxyConfig<ThemeConfig>({
  unocss: {
    shortcuts: [
      {
        'bg-base': 'bg-white dark:bg-black',
        'color-base': 'text-black dark:text-white',
        'border-base': 'border-[#8884]',
      },
    ],
    rules: [
      ['theme-text', { color: '#4b4b4b' }],
    ],
  },
})
```

在 `unocss` 配置项中直接配置 `presets` 会覆盖主题和 Valaxy 默认的 `presets`。

如果想扩展这些预设，请使用 [unocssPresets](#unocsspresets)。


```ts [valaxy.config.ts]
import { presetIcons } from 'unocss'

export default defineValaxyConfig<ThemeConfig>({
  unocss: {
    presets: [
      presetIcons({
        extraProperties: {
          'display': 'inline-block',
          'height': '1.2em',
          'width': '1.2em',
          'vertical-align': 'text-bottom',
        },
      }),
    ],
  },
})
```


::: tip
在 `uno.config.ts` 或 `unocss.config.ts` 文件中配置 `presets` 也会覆盖 Valaxy 或主题的默认预设。  
若要扩展预设，请使用 [unocssPresets](#unocsspresets) 。
:::



## unocssPresets {#unocsspresets}

若要在 Valaxy 中扩展 [UnoCSS presets](https://unocss.dev/guide/presets) 配置项，以下是一个基本示例


```ts [valaxy.config.ts]
import { presetIcons } from 'unocss'

export default defineValaxyConfig<ThemeConfig>({
  unocssPresets: {
    icons: {
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    },
  },
})
```

::: danger

<span lang="zh-CN">

以下方式是错误的写法，注意 `unocssPresets` 和 `unocss` 配置项之间的区别

</span>

<span lang="en">

The following method is incorrect. Note the difference between the `unocssPresets` and `unocss` configuration options:

</span>

```ts [valaxy.config.ts]
import { presetIcons } from 'unocss'

export default defineValaxyConfig<ThemeConfig>({
  unocssPresets: {
    // ❌ This won't work
    icons: presetIcons({ // [!code error]
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
  },
})
```

:::

## FAQ {#faq}


### 关于 UnoCSS 热重载失效 {#about-unocss-hot-reloading-failure}

> 由于目前无法获取 UnoCSS 的 ctx，暂时还没有找到一个好的方法来实现热重载
[#48](https://github.com/YunYouJun/valaxy/issues/48)


