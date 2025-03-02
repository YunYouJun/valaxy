---
title: Custom Styles
title_zh: 自定义样式
categories:
  - custom
end: false
---

## 自动样式注入 {lang="zh-CN"}

## Automatic Style Injection {lang="en"}

> 仅首次新建 styles/index.scss 文件时，需要重启开发服务器，以确保 scss 被加载。

:::zh-CN
新建 `styles` 文件夹，目录下的以下文件将会被自动引入：

- `index.ts`
- `index.scss`
- `index.css`
- `css-vars.scss` (推荐在 `index.ts` 中自己引入 `xxx.scss`，后续可能会被弃用)

我们推荐您：

- 新建 `index.ts` 文件，并在其中自由引入其他样式文件 `xxx.scss`。
- `index.ts` / `index.scss` / `index.css` 不应当同时存在，否则可能会导致重复引入。

:::

:::en
Create `styles` folder, and the following files under the directory will be automatically imported:

- `index.ts`
- `index.scss`
- `index.css`

We recommend you:

- Create `index.ts` file, and import other style files `xxx.scss` freely.
- `index.ts` / `index.scss` / `index.css` should not exist at the same time, otherwise it may cause duplicate imports.

:::

## 自定义字体 {lang="zh-CN"}

## Custom Font {lang="en"}

:::zh-CN
譬如你可以在 `styles/index.ts` 中覆盖默认的字体。

- `serif`: 衬线字体：<span font="serif">字体 abcd 123</span>
- `sans`: 非衬线字体：<span font="sans">字体 abcd 123</span>
- `mono`: 等宽字体：<span font="mono">字体 abcd 123</span>

:::

:::en
For example, you can override the default font in 'styles/index.ts'.

- `serif`: serif font: <span font="serif">Font abcd 123</span>
- `sans`: sans-serif font: <span font="sans">Font abcd 123</span>
- `mono`: monospaced font: <span font="mono">Font abcd 123</span>

:::

```ts [styles/index.ts]
import './vars.scss'
```

```scss [styles/vars.scss]
:root {
  --va-font-serif: 'Noto Serif SC', STZhongsong, STKaiti, KaiTi, Roboto,  serif;
  --va-font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --va-font-mono: Menlo, Monaco, Consolas, "Courier New", monospace;
}
```

## 示例

### 自定义光标 {lang="zh-CN"}

### Custom Cursor {lang="en"}

替换鼠标光标样式。

例如使用 [Material Design Cursors](https://www.deviantart.com/rosea92/art/Material-Design-Cursors-Dark-756850032)。

- `default`: 默认状态下图标。
- `pointer`: 指针（即链接状态下）图标。
- `text`: 文本选择图标。

新建 `styles/index.ts` 文件，引入 `vars.scss`：

```ts [styles/index.ts]
import './vars.scss'
```

新建 `styles/vars.scss` 文件：

```scss [styles/vars.scss]
:root {
  --cursor-default: url('https://cdn.yunyoujun.cn/css/md-cursors/pointer.cur');
  --cursor-pointer: url('https://cdn.yunyoujun.cn/css/md-cursors/link.cur');
  --cursor-text: url('https://cdn.yunyoujun.cn/css/md-cursors/text.cur');
}

body {
  cursor: var(--cursor-default), auto;
}

a {
  cursor: var(--cursor-pointer), auto;

  &:hover {
    cursor: var(--cursor-pointer), auto;
  }
}

button {
  cursor: var(--cursor-pointer), pointer;
}

input {
  cursor: var(--cursor-text), text;
}
```
