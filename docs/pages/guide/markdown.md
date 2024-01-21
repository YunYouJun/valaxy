---
title_zh-CN: Markdown 扩展
title: Markdown Extensions
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

## Emoji表情支持 :tada:

**输入**

```
:tada: :100:
```

**输出**

:tada: :100:

这是一个我们所 [支持的Emoji列表](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.mjs) 。

## 目录

**输入**

```
[[toc]]
```

**输出**

[[toc]]

Rendering of the TOC can be configured using the `markdown.toc` option.

## 代码行高亮

**输入**

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

**输出**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

**输入**

````md
```ts {1}
// 默认禁用行号显示
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// 启用行号显示
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// 行号已启用，并从 2 开始计数
const line3 = 'This is line 3'
const line4 = 'This is line 4'
```
````

**输出**

```ts {1}
// 默认禁用行号显示
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers {1}
// 启用行号显示
const line2 = 'This is line 2'
const line3 = 'This is line 3'
```

```ts:line-numbers=2 {1}
// 行号已启用，并从 2 开始计数
const line3 = 'This is line 3'
const line4 = 'This is line 4'
````

## 代码块的增减色块标识

在一行上添加 `// [!code --]` 或者 `// [!code ++]` 注释将创建该行代码的增减标识，同时保持代码块的颜色。

**输入**

请注意，在 `!code`后面只需要一个空格，这里有两个空格以防被渲染。

````
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code  --]
      msg: 'Added' // [!code  ++]
    }
  }
}
```
````

**输出**

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

## 代码块中的错误和警告

在一行代码后中添加 `// [!code warning]` 或者 `// [!code error]` 注释将会使改行代码呈现指定颜色块。

**输入**

请注意，在 `!code`后面只需要一个空格，这里有两个空格以防被渲染。

````
```js
export default {
  data () {
    return {
      msg: 'Error', // [!code  error]
      msg: 'Warning' // [!code  warning]
    }
  }
}
```
````

**输出**

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

## 导入代码片段

您可以通过以下语法从现有文件中导入代码片段：

```md
<<< @/filepath
```

它还支持 [行高亮](#line-highlighting-in-code-blocks):

```md
<<< @/filepath{highlightLines}
```

**输入**

```md
<<< @/snippets/snippet.js{2}
```

**代码文件**

<<< @/snippets/snippet.js

**输出**

<<< @/snippets/snippet.js

::: tip
`@` 的值与源根相对应。默认情况下是博客根目录，除非配置了 `srcDir` 。另外，你也可以从相对路径导入：

```md
<<< ../snippets/snippet.js
```

:::

您也可以使用 [VS Code region](https://code.visualstudio.com/docs/editor/codebasics#_folding) 只包含代码文件的相应部分。您可以在文件路径后的 `#` 后提供自定义区域名称：

**输入**

```md
<<< @/snippets/snippet-with-region.js#snippet{1}
```

**代码文件**

<<< @/snippets/snippet-with-region.js

**输出**

<<< @/snippets/snippet-with-region.js#snippet{1}

您也可以像这样在大括号（`{}`）内指定语言：

```md
<<< @/snippets/snippet.cs{c#}

<!-- with line highlighting: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#}

<!-- with line numbers: -->

<<< @/snippets/snippet.cs{1,2,4-6 c#:line-numbers}
```

如果无法从文件扩展名推断源语言，这将很有帮助。

## Code Groups

您可以像这样对多个代码块进行分组：

**输入**

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

**输出**

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

你也可以在代码组中 [导入代码片段](#import-code-snippets) 。

**输入**

```md
::: code-group

<!-- filename is used as title by default -->

<<< @/snippets/snippet.js

<!-- you can provide a custom one too -->

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::
```

**输出**

::: code-group

<<< @/snippets/snippet.js

<<< @/snippets/snippet-with-region.js#snippet{1,2 ts:line-numbers} [snippet with region]

:::

## 容器（标签）

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

::: details Click to expand

details

:::

## KaTeX语法支持

::: tip

有关更多KaTeX语法的信息可以在 [此处](/examples/katex) 找到。

:::

**输入**

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

**输出**

当 $a \ne 0$时，$(ax^2 + bx + c = 0)$ 有两个解，他们是
$$ x = {-b \pm \sqrt{b^2-4ac} \over 2a} $$

**Maxwell's equations:**

| equation                                                                                                                                                                  | description                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| $\nabla \cdot \vec{\mathbf{B}}  = 0$                                                                                                                                      | divergence of $\vec{\mathbf{B}}$ is zero                                               |
| $\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t}  = \vec{\mathbf{0}}$                                                          | curl of $\vec{\mathbf{E}}$ is proportional to the rate of change of $\vec{\mathbf{B}}$ |
| $\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} = \frac{4\pi}{c}\vec{\mathbf{j}}    \nabla \cdot \vec{\mathbf{E}} = 4 \pi \rho$ | _wha?_                                                                                 |

### 自定义 KaTeX 选项

> [KaTeX选项](https://katex.org/docs/options.html)

```ts
// valaxy.config.ts
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

## 包含MarkDown文件<!--  -->

::: tip
你也可以在 markdown 路径前加上 `@`，它将作为源代码根目录。默认情况下，它是 Valaxy 项目的根目录。
:::

**输入**

```md
## Docs

<!--@include: @/TEST.md-->
<!--@include: ./parts/basics.md-->
```

**部分文件**

::: code-group

```md [parts/basics.md]
一些入门知识。

### 配置

可使用 `.foorc.json` 创建。
```

```md [TEST.md]
我只是一个测试。
```

:::

**等效代码**

```md
## 文档

我只是一个测试。
一些入门知识。

### 配置

可使用 `.foorc.json` 创建。
```

它还支持选择行范围：

**输入**

```md
## 文档

<!--@include: @/TEST.md-->
<!--@include: ./parts/basics.md{3,}-->
```

**部分文件**

::: code-group

```md [parts/basics.md]
一些入门知识。

### 配置

可使用 `.foorc.json` 创建。
```

```md [TEST.md]
我只是一个测试。
```

:::

**等效代码**

```md
## 文档

我只是一个测试。
### 配置

可使用 `.foorc.json` 创建。
```

所选行范围的格式可以是： `{3,}`, `{,10}`, `{1,10}`

::: warning
请注意，如果文件不存在，该功能不会出错。因此，在使用此功能时，请确保内容已按预期渲染。
:::

## UnoCSS

我们集成了 [UnoCSS](https://unocss.dev)，因此您可以在标记符文件中使用它。

自由控制你的布局！

> 更多配置见 [UnoCSS | 扩展配置](/guide/config/extend#unocss-presets)。

<div class="flex flex-col">

<div class="flex grid-cols-3">
  <div>

  ![image](https://yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://yunyoujun.cn/images/avatar.jpg)
  </div>
</div>

<div class="flex grid-cols-2 justify-center items-center">

![image](https://cdn.yunyoujun.cn/img/bg/stars-timing-1.jpg)

![image](https://fastly.jsdelivr.net/gh/YunYouJun/cdn/img/bg/astronaut.webp)

</div>

</div>

```html
<div class="flex flex-col">

<div class="flex grid-cols-3">
  <div>

  ![image](https://yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://yunyoujun.cn/images/avatar.jpg)
  </div>

  <div>

  ![image](https://yunyoujun.cn/images/avatar.jpg)
  </div>
</div>

<div class="flex grid-cols-2 justify-center items-center">

![image](https://cdn.yunyoujun.cn/img/bg/stars-timing-1.jpg)

![image](https://fastly.jsdelivr.net/gh/YunYouJun/cdn/img/bg/astronaut.webp)

</div>

</div>
```
