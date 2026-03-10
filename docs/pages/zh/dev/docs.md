---
title: 参与文档
categories:
  - dev
end: false
---

## Docs Writing {#docs-writing}

Valaxy 正在为 1.0 的发布做准备，我们很期待您参与文档的撰写与翻译。

## 如何翻译 {#如何翻译}

Valaxy 将中英文写一个 Markdown 文件中，因此您可以很容易地进行前后文对比。

您可以以如下方式进行中英文内容书写，而文中公共的例子则只需保留一份。

```md [pages/posts/xxx.md]
**效果如下**（点击按钮切换）：


<div>
This is an example.
</div>
```

更多请参见 [单页 i18n](https://valaxy.site/guide/i18n)。

## 如何提交 {#如何提交}

使用 GitHub 的 Pull Request 向 valaxy 提交即可。
建议您以一个完整的 md 文件或一个分类翻译为一次提交。

Commit message 请以 `docs:` 开头。

譬如，我对文档的指南部分的翻译进行了修改。
即：`docs: update guide translation`。

修改了 `xxx.md` 中的错别字：
即：`docs: fix xxx.md typo`。

