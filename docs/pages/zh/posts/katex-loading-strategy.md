---
title: Math 渲染引擎评估与加载策略
excerpt: 回顾 KaTeX 与 MathJax 的选型评估，并补充 Valaxy 1.0 的样式加载、单篇配置与 SSG 更正。
date: 2026-02-23
tags:
  - performance
  - katex
  - mathjax
  - dev-notes
end: false
updated: 2026-10-04
---

::: warning 历史评估 · 2026-10-04 按 Valaxy 1.0 核对
本文保留 **2026-02-23** 的选型评估。配置示例仍有参考价值，使用 Valaxy 1.0 时需要结合以下更正：

- Critical CSS 内联已移除。SSG 不代表 CSS 全部内联或没有样式请求；当前使用构建资源与 FOUC guard 处理样式。
- `features.katex: false` 关闭默认 KaTeX 渲染，单篇仍可通过 `katex: true` 开启。因此，未启用 MathJax 时，KaTeX 插件和样式仍会保留以支持单篇覆盖。
- `math: true` 启用 MathJax，并优先于 KaTeX。Valaxy 也已为 KaTeX 注册化学公式所需的 mhchem 扩展。
- 下文的体积和性能数据属于当时的观察，不是 1.0 的实测结果或性能承诺。请结合当前依赖版本，以及站点实际生成的 HTML、样式和字体测量。

当前用法见[数学配置](/zh/guide/markdown#math-formulas)、[公式示例](/zh/examples/math)与 [SSG 迁移说明](/zh/migration/version#ssg-remove-vite-ssg)。
:::

## 背景 {#背景}

Valaxy 需要支持 Markdown 中的数学公式渲染。此前仅支持 KaTeX，VitePress 则选择了 MathJax3。本文评估两种引擎的优劣，以及 KaTeX 的加载策略。

<!-- more -->

## KaTeX vs MathJax3 对比 {#katex-vs-mathjax3-对比}

### 渲染性能 {#渲染性能}

| 维度 | KaTeX | MathJax3 |
|------|-------|----------|
| 渲染速度 | 极快（专为速度优化） | 较慢（功能更全面） |
| 渲染位置 | Node 端构建时渲染为 HTML | Node 端构建时渲染为 SVG |
| 客户端 JS | 零（构建时已渲染完成） | 零（构建时已渲染完成） |

两者在 Valaxy 中都是**构建时渲染**，不依赖客户端 JS，因此运行时性能差异不大。

### 输出格式与依赖 {#输出格式与依赖}

| 维度 | KaTeX | MathJax3 |
|------|-------|----------|
| **输出格式** | HTML + CSS spans | **SVG**（自包含矢量图） |
| **外部 CSS** | 需要 `katex.min.css`（~1.2KB gzip） | **无** |
| **字体文件** | ~20 个 woff2（浏览器按需加载） | **无**（SVG 内嵌字形） |
| **FOUC 风险** | CSS 未加载前有闪烁风险 | **无**（SVG 自包含） |
| **按需特性** | 需要全局加载 CSS | **天然按需**——无公式页面零开销 |

### 功能完整性 {#功能完整性}

| 维度 | KaTeX | MathJax3 |
|------|-------|----------|
| LaTeX 覆盖度 | 大部分常用命令 | 更全面，支持更多扩展 |
| 交换图/XyJax | 不支持 | 支持（通过 XyJax-v3） |
| `\ce{}` 化学 | Valaxy 已注册 mhchem 扩展 | 内置支持 |
| `\cancel`/`\xcancel` | 支持 | 支持 |
| 自定义宏 | 支持 | 支持（更灵活） |
| 可访问性 | MathML 输出 | MathML + SVG |

### 依赖体积（npm 包大小） {#依赖体积npm-包大小}

| | KaTeX | MathJax3 (`markdown-it-mathjax3`) |
|---|---|---|
| 安装大小 | `katex`: ~3.5MB（含字体） | `markdown-it-mathjax3@4`: ~40MB（`mathjax-full`） |
| 客户端影响 | ~1.2KB CSS（gzip） | 零 |

> MathJax 的 npm 安装体积更大，但这仅影响 `node_modules`，不影响客户端产物。

### 为什么 VitePress 选择 MathJax3？ {#为什么-vitepress-选择-mathjax3}

1. **零运行时依赖**：SVG 内联在 HTML 中，无需 CSS/字体/JS
2. **天然按需**：无公式页面完全零开销
3. **通用文档工具**：大多数文档站不使用数学公式，MathJax 的 SVG 方案确保零影响
4. **`math: false` 默认关闭**：仅需要时才安装和启用

### Valaxy 的选择：KaTeX + MathJax 分离配置 {#valaxy-的选择katex-mathjax-分离配置}

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

// 默认不渲染公式；单篇仍可通过 frontmatter.katex: true 开启
export default defineValaxyConfig({
  features: { katex: false },
})
```

- `features.katex` — 控制 KaTeX（Valaxy 原有配置，保持不变）
- `math` — 控制 MathJax（对齐 VitePress `markdown.math`）
- 两者互斥：启用 `math` 时 KaTeX 自动禁用

---

## KaTeX 加载策略评估 {#katex-加载策略评估}

### 前提 {#前提}

当选择 KaTeX 引擎时，首页首屏不需要渲染数学公式，但 `katex.min.css`（~25KB）及字体文件会在所有页面全局加载。评估是否应改为按需加载。

### 方案对比 {#方案对比}

#### 方案 A：全局条件加载（当前方案） {#方案-a全局条件加载当前方案}

在 `virtual/styles.ts` 中，未启用 MathJax 时全局引入 `katex.min.css` + `katex.scss`，以支持默认渲染和单篇 `katex` 覆盖。

#### 方案 B：按需加载 {#方案-b按需加载}

从全局样式移除 KaTeX CSS，通过 node 端正则检测文章内容中的数学公式语法、客户端 DOM 检测 `.katex` 元素，按需动态 `import()` CSS。

#### 对比 {#对比}

| 维度 | 全局加载 | 按需加载 |
|------|---------|---------|
| 首屏性能 | ~1.2KB gzip CSS | 无数学页面零开销 |
| 实现复杂度 | 一行 import | node 检测 + composable + DOM 检测，分布 5+ 文件 |
| 可靠性 | 不可能遗漏 | 依赖正则和 DOM 检测的完备性 |
| FOUC 风险 | 无 | 列表页 DOM 检测路径存在短暂 FOUC |
| SSG 友好度 | 完美 | 文章详情页 OK；列表页 `onMounted` 路径不参与 SSR |
| 维护成本 | 低 | 中——多处代码联动，正则需持续维护 |

### 按需加载方案的具体问题 {#按需加载方案的具体问题}

#### 1. 正则检测误判与遗漏（严重） {#1-正则检测误判与遗漏严重}

```ts
const hasInlineMath = /(?<![\\$])\$(?!\$)(?!\s).+?(?<!\s)\$(?!\$)/s.test(content)
const hasBlockMath = /\$\$[\s\S]+?\$\$/.test(content)
```

- **误判**：代码块中的 `$`（如 `$HOME`）、金额 `$100` 会被误匹配
- **遗漏**：`\( ... \)`、`\[ ... \]`、`\begin{equation}` 等 LaTeX 语法未检测

#### 2. 列表页摘要的 FOUC（中等） {#2-列表页摘要的-fouc中等}

文章列表页通过 `v-html` 渲染含 KaTeX 的 excerpt。DOM 检测在 `onMounted` 后执行，CSS 动态 `import()` 存在加载延迟，导致公式短暂以无样式原始文本呈现。

#### 3. SSR 模块级状态（中等） {#3-ssr-模块级状态中等}

`loaded` 变量为模块级别，SSR 中跨请求共享，可能导致部分页面的 CSS 未被 Vite 正确收集。

#### 4. 覆盖范围不完整 {#4-覆盖范围不完整}

列表页、摘要组件（`YunPostCard`、`PressArticleCard`）不经过 `ValaxyMd.vue`，需要额外的全局 DOM 检测兜底。

### 关键认知 {#关键认知}

**KaTeX CSS 的实际成本被高估了：**

- `katex.min.css` 原始 ~25KB，但 gzip 后仅 **~1.2KB**（大量重复的 `@font-face` 声明压缩率极高）
- 字体文件由浏览器**天然按需加载**——只有页面实际渲染了对应 `@font-face` 的元素才会下载字体，不使用 KaTeX 的页面**不会下载任何字体文件**
- 当时记录的 CSS 压缩体积约为 **1.2KB gzip**，不含字体和其他资源。当前请求数量与体积应以实际构建产物为准。

### KaTeX 加载结论 {#katex-加载结论}

**KaTeX 引擎保持全局条件加载**，理由：

1. 1.2KB 的 CSS 开销对首屏性能影响可忽略不计
2. 按需加载引入的工程复杂度、FOUC 风险、正则维护成本远超其收益
3. 博客场景下技术文章普遍使用数学公式，按需加载的实际收益有限
4. 样式统一交给构建产物加载；**Valaxy 1.0 已移除 Critical CSS 内联**，不能再以 SSG 推断没有额外 CSS 请求。

**如果需要零 CSS 开销**，推荐切换到 MathJax `math: true`，从架构层面彻底消除外部 CSS/字体依赖。

---

## 总结 {#总结}

| | KaTeX | MathJax3 |
|---|---|---|
| 适用场景 | 简单公式、追求极速渲染 | 复杂 LaTeX、需要零客户端依赖 |
| 推荐人群 | 大多数博客作者（默认） | 学术写作、重度数学用户 |
| 客户端开销 | ~1.2KB CSS | 零 |
| 配置 | `features: { katex: true }` | `math: true` |
