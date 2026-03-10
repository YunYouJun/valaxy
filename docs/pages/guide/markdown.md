---
title: Markdown Extensions
categories:
  - guide
end: false
---

::: info
与 `Hexo` 不同，`Valaxy` 在框架层面实现了一些 Markdown 扩展（如 Container、数学公式）等，而无需主题开发者再次实现。

这与 `VitePress` 许多功能类似，`Valaxy` 从 `VitePress` 中借鉴了许多，并复用了 [mdit-vue](https://github.com/mdit-vue/mdit-vue) 的插件。
但也存在一些不同之处，Valaxy 默认使用 [KaTeX](https://katex.org/)（渲染速度快），同时也支持 [MathJax](https://www.mathjax.org/)（对齐 VitePress，SVG 输出无需外部 CSS/字体）。

> **注意**：`features.katex` 与 `math` 请勿同时开启，两者使用不同的渲染引擎，同时启用可能导致公式重复渲染或样式冲突。启用 `math`（MathJax）时，`features.katex` 会被自动忽略。

```ts [valaxy.config.ts]
export default defineValaxyConfig({
  // KaTeX（默认开启）
  features: { katex: true },

  // 或切换到 MathJax（需先安装：pnpm add markdown-it-mathjax3）
  // math: true,
})
```

当然，你仍然可以在 Valaxy 中通过添加 MarkdownIt 插件来实现更多功能。
:::

## 在 Markdown 中使用 Vue

可以直接在 Markdown 文件中导入和使用 Vue 组件。

例如在 `components` 目录下创建一个 Vue 组件 `CustomVueDemo.vue`：

<<< @/components/CustomVueDemo.vue [components/CustomVueDemo.vue]

```md [pages/posts/xxx.md]
---
title: 在 Markdown 中使用 Vue
---

<!-- 在 markdown 中直接使用即可： -->
<CustomVueDemo />
```

## Emoji :tada:


**Input**


```md
:tada: :100:
```

**Output**


:tada: :100:
A [list of all emojis](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) is available.


## Table of Contents


**Input**


```md
[[toc]]
```

**Output**


[[toc]]

Rendering of the TOC can be configured using the `markdown.toc` option.


## Line of Code Highlighting


**Input**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**


```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

**Input**


````md
```ts {1}
// line-numbers is disabled by default
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// line-numbers is enabled
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// line-numbers is enabled and start from 2
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```
````

**Output**


```ts {1}
// line-numbers is disabled by default
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// line-numbers is enabled
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// line-numbers is enabled and start from 2
const line3 = 'This is line 3'
const line4 = 'This is line 4'
````

## Colored Diffs in Code Blocks


Adding the `// [!code --]` or `// [!code ++]` comments on a line will create a diff of that line, while keeping the colors of the codeblock.


**Input**


Note that only one space is needed after `!code`, there are two spaces here in case it is rendered.

````md
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!!code --]
      msg: 'Added' // [!!code ++]
    }
  }
}
```
````

**Output**


```js
export default {
  data() {
    return {
      msg: 'Removed', // [!code --]
      msg: 'Added', // [!code ++]
    }
  }
}
```

## Errors and Warnings in Code Blocks


Adding the `// [!code warning]` or `// [!code error]` comments on a line will color it accordingly.


**Input**


Note that only one space is needed after `!code`, there are two spaces here in case it is rendered.


````md
```js
export default {
  data () {
    return {
      msg: 'Error', // [!!code error]
      msg: 'Warning' // [!!code warning]
    }
  }
}
```
````

**Output**


```js
export default {
  data() {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

## Import Code Snippets


You can import code snippets from existing files via following syntax:


```md
<<< @/filepath
```

It also supports [line highlighting](#line-of-code-highlighting):


```md
<<< @/filepath{highlightLines}
```

**Input**


```md
<<< @/snippets/snippet.js{2}
```

**Code file**


<<< @/snippets/snippet.js

**Output**


<<< @/snippets/snippet.js

::: tip

The value of `@` corresponds to the source root. By default it's the blog root, unless `srcDir` is configured. Alternatively, you can also import from relative paths:


```md
<<< ../snippets/snippet.js
```

:::

You can also use a [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) to only include the corresponding part of the code file. You can provide a custom region name after a `#` following the filepath:


**Input**


```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**Code file**


<<< @/snippets/snippet-with-region.js

**Output**


<<< @/snippets/snippet-with-region.js#snippet{1}

You can also specify the language inside the braces (`{}`) like this:


```md
<<< @/snippets/snippet.cs{c#}

<!-- with line highlighting: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- with line numbers: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

This is helpful if source language cannot be inferred from your file extension.


::: tip

tip

:::

::: warning

warning

:::

::: danger

danger

:::

::: info

info

:::
```

::: details Click to expand

Details Content

:::

```md
::: details Click to expand

Details Content

:::
```


You can also customize new container names.


```md
::: custom

I am a custom block.

:::
```

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  markdown: {
    blocks: {
      custom: {
        icon: 'i-ri:info-i',
        text: 'CUSTOM',
      },
    }
  }
})
```


## Add Code Block Title And Icons

它基于 [vitepress-plugin-group-icons](https://github.com/yuyinws/vitepress-plugin-group-icons) 实现，内置了一些[常用图标](https://vp.yuy1n.io/features.html#built-in-icons)，你可以如下自定义更多图标。

```ts [valaxy.config.ts] {5-14}
import { defineValaxyConfig } from 'valaxy'
import { localIconLoader } from 'vitepress-plugin-group-icons'

export default defineValaxyConfig({
  groupIcons: {
    customIcon: {
      // valaxy: 'https://valaxy.site/favicon.svg',
      valaxy: localIconLoader(import.meta.url, './public/favicon.svg'),
      nodejs: 'vscode-icons:file-type-node',
      playwright: 'vscode-icons:file-type-playwright',
      typedoc: 'vscode-icons:file-type-typedoc',
      eslint: 'vscode-icons:file-type-eslint',
      dockerfile: 'vscode-icons:file-type-docker',
    },
  }
})
```

此时，使用以下语法：

````md
```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({}) 
```
```dockerfile [sample.dockerfile]
FROM ubuntu

ENV PATH /opt/conda/bin:$PATH
```
````

我们将会得到带有 `valaxy.config.ts` 标题与 Valaxy 图标的代码块：

```ts [valaxy.config.ts]
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({})
```

还会得到带有 `sample.dockerfile` 标题与 Docker 图标的代码块：

```dockerfile [sample.dockerfile]
FROM ubuntu

ENV PATH /opt/conda/bin:$PATH
```

## Math Formulas


::: tip


More information about math formula examples can be found [here](/examples/math).


:::

**Input**


```md
When $a \ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$ and they are
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |
```

**Output**
When $a \ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$ and they are
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**


| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |

### Custom KaTeX Options


> [KaTeX options](https://katex.org/docs/options.html)


```ts [valaxy.config.ts]
export default defineValaxyConfig({
  markdown: {
    /**
     * KaTeX options
     * @see https://katex.org/docs/options.html
     */
    katex: {
      strict: false
    }
  }
})
```

## Markdown File Inclusion<!--  -->


::: tip
You can also prefix the markdown path with `@`, it will act as the source root. By default, it's the Valaxy project root.
:::

**Input**


```md [your-file.md]
## Docs

<!--@include: @/TEST.md-->
<!--@include: ./parts/basics.md-->
```

**Part file**


::: code-group

```md [parts/basics.md]
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

```md [TEST.md]
I'm a TEST.
```

:::

**Equivalent code**


```md
## Docs

I'm a TEST.
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

It also supports selecting a line range:


**Input**


```md
## Docs

<!--@include: @/TEST.md-->
<!--@include: ./parts/basics.md{3,}-->
```

**Part file**


::: code-group

```md [parts/basics.md]
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

```md [TEST.md]
I'm a TEST.
```

:::

**Equivalent code**


```md
## Docs

I'm a TEST.
### Configuration

Can be created using `.foorc.json`.
```

The format of the selected line range can be: `{3,}`, `{,10}`, `{1,10}`


::: warning

Note that this does not throw errors if your file is not present. Hence, when using this feature make sure that the contents are being rendered as expected.


:::

## UnoCSS

We integrated [UnoCSS](https://unocss.dev), so you can use it in your markdown file.


Freedom to control your layout!

> More configurations see [UnoCSS Options](/guide/config/unocss-options).


<div class="flex flex-col">

<div class="flex grid-cols-3" gap="2">
  <div>

  ![image](https://www.yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://www.yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://www.yunyoujun.cn/images/avatar.jpg)
  </div>
</div>

<div class="flex grid-cols-2 justify-center items-center" gap="2">

![image](https://cdn.yunyoujun.cn/img/bg/stars-timing-1.jpg)

![image](https://cdn.yunyoujun.cn/img/bg/astronaut.webp)

</div>

</div>

```html [pages/posts/your-post.md]
<div class="flex flex-col">

<div class="flex grid-cols-3">
  <div>

  ![image](https://www.yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://www.yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://www.yunyoujun.cn/images/avatar.jpg)
  </div>
</div>

<div class="flex grid-cols-2 justify-center items-center">

![image](https://cdn.yunyoujun.cn/img/bg/stars-timing-1.jpg)

![image](https://cdn.yunyoujun.cn/img/bg/astronaut.webp)

</div>

</div>
```

## Mermaid

Based on [mermaid](https://mermaid.js.org/), you can use it in your markdown file directly.

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

````txt
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

More examples see: [Mermaid](/examples/mermaid)


## Footnote


You can use `[^1]` or `[^footnote]` to add footnotes, for example:

```md
This is a footnote[^1-en].

This is a paragraph of footnote[^2-en].

[^1-en]: This is a footnote.

[^2-en]: This is a paragraph of footnote.

  Footnote paragraphs with correct indentation will be automatically attached.

Use `^[content]` to create convenient inline footnotes^[like this!].
```

This is a footnote[^1-en].

This is a paragraph of footnote[^2-en].

[^1-en]: This is a footnote.

[^2-en]: This is a paragraph of footnote.

  Footnote paragraphs with correct indentation will be automatically attached.

Use `^[content]` to create convenient inline footnotes^[like this!].


### Footnote Preview


With [`Floating Vue`](https://floating-vue.starpad.dev/), the added footnote links will display the footnote content when hovering over them. You can try it with the footnote links on this page!

If you want to customize the style of the footnote, you can refer to `config` in the [Floating Vue documentation](https://floating-vue.starpad.dev/guide/config) and change the `floatingVue` option in `site.config.ts` accordingly. You can also modify the `ValaxyFootnoteTooltip` component to achieve this.


## Custom


### Custom Markdown Container Class


You can add `markdownClass` in the frontmatter of the markdown file to customize the Class of the Markdown container.


```md
---
markdownClass: 'markdown-body custom-markdown-class'
---
```
