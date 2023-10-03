---
title: Custom Styles
title_zh-CN: 自定义样式
categories:
  - custom
end: false
---

## 自动样式注入 {lang="zh-CN"}

## Automatic Style Injection {lang="en"}

> 仅首次新建 styles/index.scss 文件时，需要重启开发服务器，以确保 scss 被加载。

:::zh-CN
新建 `styles` 文件夹，目录下的以下文件将会被自动引入：

- `index.scss`
- `index.css`
- `css-vars.scss`
- `css-vars.css`

我们推荐您：

- 新建 `index.scss` 书写全局样式，并可在其中导入其他样式，它会被自动引入。
- 新建 `css-vars.scss` 书写 CSS 变量，它会被自动引入。
:::

:::en
Create `styles` folder, and the following files under the directory will be automatically imported:

- `index.scss`
- `index.css`
- `css-vars.scss`
- `css-vars.css`

We recommend you:

- Create `index.scss` file to write a global style and import other styles in it. It will be imported automatically.
- Create `css-vars.scss` file to write CSS variables. It will be imported automatically.
:::

## 自定义字体 {lang="zh-CN"}

## Custom Font {lang="en"}

:::zh-CN
譬如你可以在 `styles/css-vars.scss` 中覆盖默认的字体。

- `serif`: 衬线字体：<span font="serif">字体 abcd 123</span>
- `sans`: 非衬线字体：<span font="sans">字体 abcd 123</span>
- `mono`: 等宽字体：<span font="mono">字体 abcd 123</span>
:::

:::en
For example, you can override the default font in 'styles/css-vars.scss'.

- `serif`: serif font: <span font="serif">Font abcd 123</span>
- `sans`: sans-serif font: <span font="sans">Font abcd 123</span>
- `mono`: monospaced font: <span font="mono">Font abcd 123</span>
:::

```scss
:root {
  --va-font-serif: 'Noto Serif SC', STZhongsong, STKaiti, KaiTi, Roboto,  serif;
  --va-font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --va-font-mono: Menlo, Monaco, Consolas, "Courier New", monospace;
}
```
