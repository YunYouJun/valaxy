---
title: Math 渲染引擎评估与加载策略
date: 2026-02-23
tags:
  - performance
  - katex
  - mathjax
  - dev-notes
end: false
---

## 背景

Valaxy 需要支持 Markdown 中的数学公式渲染。此前仅支持 KaTeX，VitePress 则选择了 MathJax3。本文评估两种引擎的优劣，以及 KaTeX 的加载策略。

<!-- more -->

## KaTeX vs MathJax3 对比

### 渲染性能

| 维度 | KaTeX | MathJax3 |
|------|-------|----------|
| 渲染速度 | 极快（专为速度优化） | 较慢（功能更全面） |
| 渲染位置 | Node 端构建时渲染为 HTML | Node 端构建时渲染为 SVG |
| 客户端 JS | 零（构建时已渲染完成） | 零（构建时已渲染完成） |

两者在 Valaxy 中都是**构建时渲染**，不依赖客户端 JS，因此运行时性能差异不大。

### 输出格式与依赖

| 维度 | KaTeX | MathJax3 |
|------|-------|----------|
| **输出格式** | HTML + CSS spans | **SVG**（自包含矢量图） |
| **外部 CSS** | 需要 `katex.min.css`（~1.2KB gzip） | **无** |
| **字体文件** | ~20 个 woff2（浏览器按需加载） | **无**（SVG 内嵌字形） |
| **FOUC 风险** | CSS 未加载前有闪烁风险 | **无**（SVG 自包含） |
| **按需特性** | 需要全局加载 CSS | **天然按需**——无公式页面零开销 |

### 功能完整性

| 维度 | KaTeX | MathJax3 |
|------|-------|----------|
| LaTeX 覆盖度 | 大部分常用命令 | 更全面，支持更多扩展 |
| 交换图/XyJax | 不支持 | 支持（通过 XyJax-v3） |
| `\ce{}` 化学 | 需要额外扩展 | 内置支持 |
| `\cancel`/`\xcancel` | 支持 | 支持 |
| 自定义宏 | 支持 | 支持（更灵活） |
| 可访问性 | MathML 输出 | MathML + SVG |

### 依赖体积（npm 包大小）

| | KaTeX | MathJax3 (`markdown-it-mathjax3`) |
|---|---|---|
| 安装大小 | `katex`: ~3.5MB（含字体） | `markdown-it-mathjax3@4`: ~40MB（`mathjax-full`） |
| 客户端影响 | ~1.2KB CSS（gzip） | 零 |

> MathJax 的 npm 安装体积更大，但这仅影响 `node_modules`，不影响客户端产物。

### 为什么 VitePress 选择 MathJax3？

1. **零运行时依赖**：SVG 内联在 HTML 中，无需 CSS/字体/JS
2. **天然按需**：无公式页面完全零开销
3. **通用文档工具**：大多数文档站不使用数学公式，MathJax 的 SVG 方案确保零影响
4. **`math: false` 默认关闭**：仅需要时才安装和启用

### Valaxy 的选择：KaTeX + MathJax 分离配置

Valaxy 通过两个独立配置分别控制两种引擎，语义清晰，对齐 VitePress：

```ts
// valaxy.config.ts

// KaTeX（默认开启）
export default defineValaxyConfig({
  features: { katex: true },
})

// MathJax3（对齐 VitePress，零 CSS 依赖）
// 需先安装：pnpm add markdown-it-mathjax3
export default defineValaxyConfig({
  math: true,
})

// 禁用所有数学渲染
export default defineValaxyConfig({
  features: { katex: false },
})
```

- `features.katex` — 控制 KaTeX（Valaxy 原有配置，保持不变）
- `math` — 控制 MathJax（对齐 VitePress `markdown.math`）
- 两者互斥：启用 `math` 时 KaTeX 自动禁用

---

## KaTeX 加载策略评估

### 前提

当选择 KaTeX 引擎时，首页首屏不需要渲染数学公式，但 `katex.min.css`（~25KB）及字体文件会在所有页面全局加载。评估是否应改为按需加载。

### 方案对比

#### 方案 A：全局条件加载（当前方案）

在 `virtual/styles.ts` 中，当 math engine 为 `katex` 时全局引入 `katex.min.css` + `katex.scss`。

#### 方案 B：按需加载

从全局样式移除 KaTeX CSS，通过 node 端正则检测文章内容中的数学公式语法、客户端 DOM 检测 `.katex` 元素，按需动态 `import()` CSS。

#### 对比

| 维度 | 全局加载 | 按需加载 |
|------|---------|---------|
| 首屏性能 | ~1.2KB gzip CSS | 无数学页面零开销 |
| 实现复杂度 | 一行 import | node 检测 + composable + DOM 检测，分布 5+ 文件 |
| 可靠性 | 不可能遗漏 | 依赖正则和 DOM 检测的完备性 |
| FOUC 风险 | 无 | 列表页 DOM 检测路径存在短暂 FOUC |
| SSG 友好度 | 完美 | 文章详情页 OK；列表页 `onMounted` 路径不参与 SSR |
| 维护成本 | 低 | 中——多处代码联动，正则需持续维护 |

### 按需加载方案的具体问题

#### 1. 正则检测误判与遗漏（严重）

```ts
const hasInlineMath = /(?<![\\$])\$(?!\$)(?!\s).+?(?<!\s)\$(?!\$)/s.test(content)
const hasBlockMath = /\$\$[\s\S]+?\$\$/.test(content)
```

- **误判**：代码块中的 `$`（如 `$HOME`）、金额 `$100` 会被误匹配
- **遗漏**：`\( ... \)`、`\[ ... \]`、`\begin{equation}` 等 LaTeX 语法未检测

#### 2. 列表页摘要的 FOUC（中等）

文章列表页通过 `v-html` 渲染含 KaTeX 的 excerpt。DOM 检测在 `onMounted` 后执行，CSS 动态 `import()` 存在加载延迟，导致公式短暂以无样式原始文本呈现。

#### 3. SSR 模块级状态（中等）

`loaded` 变量为模块级别，SSR 中跨请求共享，可能导致部分页面的 CSS 未被 Vite 正确收集。

#### 4. 覆盖范围不完整

列表页、摘要组件（`YunPostCard`、`PressArticleCard`）不经过 `ValaxyMd.vue`，需要额外的全局 DOM 检测兜底。

### 关键认知

**KaTeX CSS 的实际成本被高估了：**

- `katex.min.css` 原始 ~25KB，但 gzip 后仅 **~1.2KB**（大量重复的 `@font-face` 声明压缩率极高）
- 字体文件由浏览器**天然按需加载**——只有页面实际渲染了对应 `@font-face` 的元素才会下载字体，不使用 KaTeX 的页面**不会下载任何字体文件**
- 全局加载的真实代价仅为 **1.2KB gzip CSS**，无额外网络请求

### KaTeX 加载结论

**KaTeX 引擎保持全局条件加载**，理由：

1. 1.2KB 的 CSS 开销对首屏性能影响可忽略不计
2. 按需加载引入的工程复杂度、FOUC 风险、正则维护成本远超其收益
3. 博客场景下技术文章普遍使用数学公式，按需加载的实际收益有限
4. SSG 场景下 CSS 内联到 HTML 中，不存在额外请求

**如果需要零 CSS 开销**，推荐切换到 MathJax `math: true`，从架构层面彻底消除外部 CSS/字体依赖。

---

## 总结

| | KaTeX | MathJax3 |
|---|---|---|
| 适用场景 | 简单公式、追求极速渲染 | 复杂 LaTeX、需要零客户端依赖 |
| 推荐人群 | 大多数博客作者（默认） | 学术写作、重度数学用户 |
| 客户端开销 | ~1.2KB CSS | 零 |
| 配置 | `features: { katex: true }` | `math: true` |
