---
title: Custom Blocks
---

::: custom

I am custom block.

:::

---

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

::: details

details

:::

::: danger 自定义标题

info

:::

::: details 自定义标题

details with `inline code` and [Valaxy](https://valaxy.site).

:::

<details>
<summary>原生 details：列表、行内代码与代码块示例</summary>

- **配置参考**：在 `valaxy.config.ts` 中调整配置，详情参见 [Valaxy 文档](https://valaxy.site)。
- **注意事项**：展开后内部代码块在桌面端与移动端都应保留在容器边框内。

```ts
export default {
  footer: {
    beian: {
      enable: false,
      icp: '',
    },
  },
}
```

</details>

<details open>
<summary>默认展开的 details：嵌套标题、列表代码块与警告块</summary>

### 折叠内标题

- 第一条列表段落保持紧凑间距

  ```js
  console.log('nested inside list')
  ```

- 第二条列表段落

::: warning
嵌套警告块内的 [警告链接](https://valaxy.site) 与 `warning-code` 应保留自身语义色。
:::

</details>

:::: details 内嵌代码组（移动端防溢出）

### 容器内标题

::: warning
容器内嵌警告块的 [容器警告链接](https://valaxy.site) 与 `directive-warning-code` 应保留自身语义色。
:::

::: code-group

```ts [a.ts]
export const a = 1
```

```ts [b.ts]
export const b = 2
```

:::

::::
