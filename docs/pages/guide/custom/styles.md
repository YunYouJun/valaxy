---
title: Custom Styles
title_zh-CN: 自定义样式
categories:
  - Custom
end: false
---

## 自动样式注入

新建 `styles` 文件夹，目录下的以下文件将会被自动引入：

- `index.scss`
- `index.css`
- `css-vars.scss`
- `css-vars.css`

我们推荐您：

- 新建 `index.scss` 书写全局样式，并可在其中导入其他样式，它会被自动引入。
- 新建 `css-vars.scss` 书写 CSS 变量，它会被自动引入。
