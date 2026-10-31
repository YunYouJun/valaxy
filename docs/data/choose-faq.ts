export interface ChooseFaqItem {
  question: string
  answer: string
}

/**
 * Visible text of the Selection FAQ on the choose pages.
 * Link labels are kept and Markdown syntax is not.
 * `test/choose-faq.test.ts` checks these strings against the pages.
 */
export const chooseFaq = {
  en: [
    {
      question: 'How is Valaxy different from Hexo?',
      answer: 'Both are blog frameworks: Markdown posts, themes, and a static build. For a Vue author, Valaxy is the one with Vite hot reload, typed valaxy.config.ts / site.config.ts, and themes you override as Vue components. Hexo still has the larger Chinese theme catalog. Move when you can accept a new theme: copy posts, then use Yun. Stay on Hexo only when that existing theme or plugin is the product. See Migration.',
    },
    {
      question: 'Should I use a blog framework or a docs generator?',
      answer: 'Use Valaxy when the site is posts, tags, archives, and a blog theme. VitePress is the better fit only when the site is documentation and those blog pieces are not the product. Press keeps a docs-shaped site on Valaxy, including posts and addons. It does not replace VitePress for a standalone library manual.',
    },
    {
      question: 'What is the difference between the SPA build and SSG?',
      answer: 'valaxy build emits a single-page app. valaxy build --ssg is the publish command to use: one HTML file per route, then Vue hydrates it. Later navigations update the page instead of reloading the document. That in-site navigation is the difference from Astro\'s default static output, described in Why Valaxy. See Commands.',
    },
    {
      question: 'How complete is Chinese support?',
      answer: 'This docs site keeps a full Chinese tree at /zh/ beside the English pages. Site text uses Vue i18n, and one page can carry two languages with CSS i18n. Hexo posts migrate with the Chinese migration guide. Hexo still has the deeper theme and plugin community. Valaxy\'s Chinese docs are first-class. Its theme catalog is not as large, which is why component overrides matter.',
    },
    {
      question: 'When should I not choose Valaxy?',
      answer: 'Use the list in When not Valaxy. The short version: stay on Hexo only for theme lock-in, use VitePress for a library manual, Hugo when the Go toolchain is the point, and Astro when one site mixes UI frameworks.',
    },
  ],
  zh: [
    {
      question: 'Valaxy 和 Hexo 差在哪里？',
      answer: '两者都是博客框架：Markdown 文章、主题、静态构建。对写 Vue 的人，Valaxy 有 Vite 热更新、带类型的 valaxy.config.ts / site.config.ts，以及按 Vue 组件覆盖的主题。Hexo 的中文主题目录仍然更大。可以接受新主题就迁：复制文章，然后用 Yun。只有那个现成主题或插件就是产品时，才留在 Hexo。见迁移。',
    },
    {
      question: '该用博客框架，还是文档生成器？',
      answer: '站点的主体是文章、标签、归档和博客主题时，用 Valaxy。只有站点就是文档、那些博客部件不是产品时，VitePress 更合适。Press 把文档形态留在 Valaxy 上，包括文章和插件。它不能代替一个独立的库手册去用 VitePress。',
    },
    {
      question: 'SPA 构建和 SSG 有什么区别？',
      answer: 'valaxy build 产出单页应用。发布应使用 valaxy build --ssg：每条路由一份 HTML，再由 Vue 注水。之后的跳转更新页面，而不是整页重载。这种站内导航就是和 Astro 默认静态输出的差别，写在为什么选 Valaxy。见命令行。',
    },
    {
      question: '中文支持做到什么程度？',
      answer: '这个文档站在 /zh/ 维护完整的中文页面，与英文页对应。站点文案使用 Vue i18n，单页也可以用 CSS i18n 放两种语言。Hexo 文章按中文迁移指南搬。Hexo 的主题和插件社区仍然更深。Valaxy 的中文文档是一等的，主题目录没有那么大，所以组件覆盖才重要。',
    },
    {
      question: '什么时候不该选 Valaxy？',
      answer: '看什么时候不选 Valaxy。短的说法：只在主题锁定时留在 Hexo，库手册用 VitePress，要点是 Go 工具链时用 Hugo，一个站点要混用多种 UI 框架时用 Astro。',
    },
  ],
} satisfies Record<'en' | 'zh', ChooseFaqItem[]>
