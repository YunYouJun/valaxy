---
title:
  en: Markdown Extensions
  zh-CN: Markdown 扩展
categories:
  - guide
end: false
---

::: info
与 `Hexo` 不同，`Valaxy` 在框架层面实现了一些 Markdown 扩展（如 Container、数学公式）等，而无需主题开发者再次实现。

这与 `VitePress` 许多功能类似，`Valaxy` 从 `VitePress` 中借鉴了许多，并复用了 [mdit-vue](https://github.com/mdit-vue/mdit-vue) 的插件。
但也存在一些不同之处，此前当 `Valaxy` 实现数学公式时 `VitePress` 尚未支持，目前 `Valaxy` 默认的数学公式基于 KaTeX，而 `VitePress` 基于 MathJax。

> KaTeX 相对于 MathJax 有更快的渲染速度，MathJax 则拥有更多的功能。

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

## Emoji :tada: {lang="en"}

## Emoji 表情支持 :tada: {lang="zh-CN"}

::: en
**Input**
:::

::: zh-CN
**输入**
:::

```
:tada: :100:
```

::: en
**Output**
:::

::: zh-CN
**输出**
:::

:tada: :100:
::: en
A [list of all emojis](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) is available.
:::

::: zh-CN
这是一个我们所 [支持的 Emoji 列表](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) 。
:::

## Table of Contents {lang="en"}

## 目录  {lang="zh-CN"}

::: en
**Input**
:::

::: zh-CN
**输入**
:::

```
[[toc]]
```

::: en
**Output**
:::

::: zh-CN
**输出**
:::

[[toc]]

::: en
Rendering of the TOC can be configured using the `markdown.toc` option.
:::

::: zh-CN
可以使用 `markdown.toc` 选项配置 TOC 的渲染。
:::

## Line of Code Highlighting {lang="en"}

## 代码行高亮 {lang="zh-CN"}

::: en
**Input**
:::

````
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

::: en
**Output**
:::

::: zh-CN
**输出**
:::

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

::: en
**Input**
:::

::: zh-CN
**输入**
:::

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

::: en
**Output**
:::

::: zh-CN
**输出**
:::

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

## Colored Diffs in Code Blocks {lang="en"}

## 代码块的增减色块标识  {lang="zh-CN"}

::: en
Adding the `// [!code --]` or `// [!code ++]` comments on a line will create a diff of that line, while keeping the colors of the codeblock.
:::

::: zh-CN
在一行上添加 `// [!code --]` 或者 `// [!code ++]` 注释将创建该行代码的增减标识，同时保持代码块的颜色。
:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

::: zh-CN
请注意，在 `!code`后面只需要一个空格，这里有两个空格以防被渲染。
:::

::: en
Note that only one space is needed after `!code`, there are two spaces here in case it is rendered.
:::

````
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

::: en
**Output**
:::

::: zh-CN
**输出**
:::

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

## Errors and Warnings in Code Blocks {lang="en"}

## 代码块中的错误和警告 {lang="zh-CN"}

::: en
Adding the `// [!code warning]` or `// [!code error]` comments on a line will color it accordingly.
:::

::: zh-CN
在一行代码后中添加 `// [!code warning]` 或者 `// [!code error]` 注释将会使改行代码呈现指定颜色块。
:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

::: en
Note that only one space is needed after `!code`, there are two spaces here in case it is rendered.
:::

::: zh-CN
请注意，在 `!code`后面只需要一个空格，这里有两个空格以防被渲染。
:::

````
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

::: en
**Output**
:::

::: zh-CN
**输出**
:::

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

## Import Code Snippets {lang="en"}

## 导入代码片段 {lang="zh-CN"}

::: en
You can import code snippets from existing files via following syntax:
:::

::: zh-CN
您可以通过以下语法从现有文件中导入代码片段：
:::

```md
<<< @/filepath
```

::: en
It also supports [line highlighting](#line-highlighting-in-code-blocks):
:::

::: zh-CN
它还支持 [行高亮](#line-highlighting-in-code-blocks):
:::

```md
<<< @/filepath{highlightLines}
```

::: en
**Input**
:::

::: zh-CN
**输入**
:::

```md
<<< @/snippets/snippet.js{2}
```

::: en
**Code file**
:::

::: zh-CN
**代码文件**
:::

<<< @/snippets/snippet.js

::: en
**Output**
:::

::: zh-CN
**输出**
:::

<<< @/snippets/snippet.js

::: tip

<div lang="en">
The value of `@` corresponds to the source root. By default it's the blog root, unless `srcDir` is configured. Alternatively, you can also import from relative paths:
</div>

<div lang="zh-CN">
`@` 的值与源根相对应。默认情况下是博客根目录，除非配置了 `srcDir` 。另外，你也可以从相对路径导入：
</div>

```md
<<< ../snippets/snippet.js
```

:::

::: en
You can also use a [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) to only include the corresponding part of the code file. You can provide a custom region name after a `#` following the filepath:
:::

::: zh-CN
您也可以使用 [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) 只包含代码文件的相应部分。您可以在文件路径后的 `#` 后提供自定义区域名称：
:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

::: en
**Code file**
:::

::: zh-CN
**代码文件**
:::

<<< @/snippets/snippet-with-region.js

::: en
**Output**
:::

::: zh-CN
**输出**
:::

<<< @/snippets/snippet-with-region.js#snippet{1}

::: en
You can also specify the language inside the braces (`{}`) like this:
:::

::: zh-CN
您也可以像这样在大括号（`{}`）内指定语言：
:::

```md
<<< @/snippets/snippet.cs{c#}

<!-- with line highlighting: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- with line numbers: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

::: en
This is helpful if source language cannot be inferred from your file extension.

::: zh-CN
如果无法从文件扩展名推断源语言，这将很有帮助。
:::

## Code Groups {lang="en"}

## 代码分组 {lang="zh-CN"}

::: en
You can group multiple code blocks like this:
:::

::: zh-CN
您可以像这样对多个代码块进行分组：
:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

````md
::: code-group

```js [config.js]
/**
 * @type {import('valaxy').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'valaxy'

const config: UserConfig = {
  // ...
}

export default config
```

:::
````

::: en
**Output**
:::

::: zh-CN
**输出**
:::

::: code-group

```js [config.js]
/**
 * @type {import('valaxy').UserConfig}
 */
const config = {
  // ...
}

export default config
```

```ts [config.ts]
import type { UserConfig } from 'valaxy'

const config: UserConfig = {
  // ...
}

export default config
```

:::

::: en
You can also [import snippets](#import-code-snippets) in code groups:
:::

::: zh-CN
你也可以在代码组中 [导入代码片段](#import-code-snippets) 。
:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

```md
::: code-group

<!-- filename is used as title by default -->

<<< @/snippets/snippet.js

<!-- you can provide a custom one too -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

::: en
**Output**
:::

::: zh-CN
**输出**
:::

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## Container {lang="en"}

## 容器 {lang="zh-CN"}

::: zh-CN

通过对 `markdownIt` 进行配置，你可以自由设置自定义块区域的文字以及图标及图标的颜色。

:::

::: en

By configuring `markdownIt`, you can set the text and icon (and its color) for
custom block.

:::

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

```md
:::

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

::: zh-CN

你也可以自定义新的容器名称。

:::

::: en

You can also customize new container names.

:::

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

## 添加代码块标题与图标 {lang="zh-CN"}

## Add Code Block Title And Icons {lang="en"}

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

## KaTeX {lang="en"}

## KaTeX 语法支持 {lang="zh-CN"}

::: tip

<div lang="en">

More information about $\KaTeX$ examples can be found [here](/examples/katex).
</div>

<div lang="zh-CN">

有关更多KaTeX语法的信息可以在 [此处](/examples/katex) 找到。
</div>

:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

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

::: en
**Output**
When $a \ne 0$, there are two solutions to $(ax^2 + bx + c = 0)$ and they are
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**
:::

::: zh-CN
**输出**
:::

::: zh-CN
当 $a \ne 0$时，$(ax^2 + bx + c = 0)$ 有两个解，他们是
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**麦克斯韦方程：**
:::

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |

### Custom KaTeX Options {lang="en"}

### 自定义 KaTeX 选项 {lang="zh-CN"}

::: en
> [KaTeX options](https://katex.org/docs/options.html)
:::

::: zh-CN
> [KaTeX选项](https://katex.org/docs/options.html)
:::

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

## Markdown File Inclusion<!--  --> {lang="en"}

## 包含 MarkDown 文件<!-- -->  {lang="zh-CN"}

::: tip
You can also prefix the markdown path with `@`, it will act as the source root. By default, it's the Valaxy project root.
:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

```md [your-file.md]
## Docs

<!--@include: @/TEST.md-->
<!--@include: ./parts/basics.md-->
```

::: en
**Part file**
:::

::: zh-CN
**部分文件**
:::

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

::: en
**Equivalent code**
:::

::: zh-CN
**等效代码**
:::

```md
## Docs

I'm a TEST.
Some getting started stuff.

### Configuration

Can be created using `.foorc.json`.
```

::: en
It also supports selecting a line range:
:::

::: zh-CN
它还支持选择行范围：
:::

::: en
**Input**
:::

::: zh-CN
**输入**
:::

```md
## Docs

<!--@include: @/TEST.md-->
<!--@include: ./parts/basics.md{3,}-->
```

::: en
**Part file**
:::

::: zh-CN
**部分文件**
:::

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

::: en
**Equivalent code**
:::

::: zh-CN
**等效代码**
:::

```md
## Docs

I'm a TEST.
### Configuration

Can be created using `.foorc.json`.
```

::: en
The format of the selected line range can be: `{3,}`, `{,10}`, `{1,10}`
:::

::: zh-CN
所选行范围的格式可以是： `{3,}`, `{,10}`, `{1,10}`
:::

::: warning

<div lang="en">
Note that this does not throw errors if your file is not present. Hence, when using this feature make sure that the contents are being rendered as expected.
</div>

<div lang="zh-CN">
请注意，如果文件不存在，该功能不会出错。因此，在使用此功能时，请确保内容已按预期渲染。
</div>

:::

## UnoCSS

::: en
We integrated [UnoCSS](https://unocss.dev), so you can use it in your markdown file.
:::

::: zh-CN
我们集成了 [UnoCSS](https://unocss.dev)，因此您可以在 Markdown 文件中直接使用它。
:::

::: en
Freedom to control your layout!

> More configurations see [UnoCSS Options](/guide/config/unocss-options).

:::

::: zh-CN
自由控制你的布局！

> 更多配置见 [UnoCSS Options | 配置](/guide/config/unocss-options)。

:::

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

## 脚注 {lang="zh-CN"}

## Footnote {lang="en"}

::: zh-CN
你可以使用 `[^1]` 或 `[^footnote]` 来添加脚注，例如：

```md
这是一个脚注[^1-zh]。

这是一段脚注[^2-zh]。

[^1-zh]: 这是一个脚注。

[^2-zh]: 这是一段脚注。

  正确缩进的脚注段落会被自动附加。

使用 `^[content]` 可以创建方便的内联脚注^[比如这个！]。
```

这是一个脚注[^1-zh]。

这是一段脚注[^2-zh]。

[^1-zh]: 这是一个脚注。

[^2-zh]: 这是一段脚注。

  正确缩进的脚注段落会被自动附加。

使用 `^[content]` 可以创建方便的内联脚注^[比如这个！]。
:::

::: en
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
:::

### 脚注预览 {lang="zh-CN"}

### Footnote Preview {lang="en"}

::: zh-CN
借助 [`Floating Vue`](https://floating-vue.starpad.dev/), 添加的脚注链接在鼠标悬停时会显示脚注内容。你可以在本页面的脚注链接上试一试！

如果你想要自定义脚注的样式，可以参考 [Floating Vue 文档](https://floating-vue.starpad.dev/guide/config) 中的 `config` 设置 `site.config.ts` 中的 `floatingVue`，你也可以修改组件 `ValaxyFootnoteTooltip` 来达到这一点。
:::

::: en
With [`Floating Vue`](https://floating-vue.starpad.dev/), the added footnote links will display the footnote content when hovering over them. You can try it with the footnote links on this page!

If you want to customize the style of the footnote, you can refer to `config` in the [Floating Vue documentation](https://floating-vue.starpad.dev/guide/config) and change the `floatingVue` option in `site.config.ts` accordingly. You can also modify the `ValaxyFootnoteTooltip` component to achieve this.
:::

## 自定义 {lang="zh-CN"}

## Custom {lang="en"}

### 自定义 Markdown 容器 Class {lang="zh-CN"}

### Custom Markdown Container Class {lang="en"}

::: zh-CN

你可以在 Markdown 文件的 frontmatter 中添加 `markdownClass` 来自定义 Markdown 容器的 Class。

:::

::: en

You can add `markdownClass` in the frontmatter of the markdown file to customize the Class of the Markdown container.

:::

```md
---
markdownClass: 'markdown-body custom-markdown-class'
---
```
