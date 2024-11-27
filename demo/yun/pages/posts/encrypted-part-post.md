---
title: 加密文章部分内容测试 - 密码 valaxy
date: 2023-11-02 10:41:00
categories: Test
---

## 实现文章部分内容加密

> 密码：`valaxy`

使用 [Web Crypto API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

<!-- valaxy-encrypt-start:valaxy -->

```md
{{ frontmatter }}
```

<!-- valaxy-encrypt-end -->

---

中间未被加密的内容

---

<!-- valaxy-encrypt-start:valaxy -->

::: details 动态渲染的 frontmatter
{{ frontmatter }}
:::

<!-- valaxy-encrypt-end -->

```md
<!-- valaxy-encrypt-start:valaxy -->
This should not be encrypted.
<!-- valaxy-encrypt-end -->
```
