export type ChooseFrameworkId = 'valaxy' | 'hexo' | 'vitepress' | 'hugo' | 'astro'

export type ChooseFacetId = 'fit' | 'stack' | 'build' | 'learn' | 'themes' | 'zh' | 'deploy'

export interface ChooseCompareFacet {
  id: ChooseFacetId
  label: string
}

export interface ChooseCompareFramework {
  id: ChooseFrameworkId
  name: string
  href: string
  external?: boolean
  points: Record<ChooseFacetId, string>
}

export interface ChooseCompareCopy {
  all: string
  groupLabel: string
  facetGroup: string
  external: string
  facets: ChooseCompareFacet[]
  frameworks: ChooseCompareFramework[]
}

export const chooseCompare = {
  en: {
    all: 'All',
    groupLabel: 'Compare frameworks',
    facetGroup: 'Comparison row',
    external: 'opens in a new tab',
    facets: [
      { id: 'fit', label: 'Best for' },
      { id: 'stack', label: 'Stack' },
      { id: 'build', label: 'Build' },
      { id: 'learn', label: 'Start' },
      { id: 'themes', label: 'Themes' },
      { id: 'zh', label: 'Chinese' },
      { id: 'deploy', label: 'Deploy' },
    ],
    frameworks: [
      {
        id: 'valaxy',
        name: 'Valaxy',
        href: '/guide/getting-started',
        points: {
          fit: 'A Vue blog, or a Hexo move when a new theme is acceptable',
          stack: 'Vue 3, Vite, typed config',
          build: 'Hot reload. SSG, then SPA navigation',
          learn: 'Vue authors start with `pnpm create valaxy`',
          themes: 'Yun, Press, and addons. Override Vue components',
          zh: 'Full `/zh/` docs, plus a Hexo migration guide',
          deploy: 'Static `dist/`',
        },
      },
      {
        id: 'hexo',
        name: 'Hexo',
        href: 'https://hexo.io/',
        external: true,
        points: {
          fit: 'Only when one Hexo theme or plugin is the product',
          stack: 'Node.js, Markdown, `_config.yml`',
          build: 'Generate, then refresh',
          learn: 'Shortest if you only pick an existing theme',
          themes: 'Largest Chinese catalog. Those themes do not run on Valaxy',
          zh: 'Chinese docs and community are the default',
          deploy: 'Static `public/`',
        },
      },
      {
        id: 'vitepress',
        name: 'VitePress',
        href: 'https://vitepress.dev/',
        external: true,
        points: {
          fit: 'A library manual, with no blog post model',
          stack: 'Vue 3, Vite, Markdown',
          build: 'Vite preview aimed at a docs site',
          learn: 'Low on the default docs theme',
          themes: 'A docs theme. Posts, tags, and RSS are not the product',
          zh: 'Official docs include Chinese',
          deploy: 'Static output',
        },
      },
      {
        id: 'hugo',
        name: 'Hugo',
        href: 'https://gohugo.io/',
        external: true,
        points: {
          fit: 'The Go toolchain matters more than Vue',
          stack: 'Go binary and Go templates',
          build: 'Very fast. No timing versus Valaxy is claimed here',
          learn: 'Templates and the content model, not Vue',
          themes: 'Many site themes, not Vue component themes',
          zh: 'Docs are mainly English',
          deploy: 'Static `public/`',
        },
      },
      {
        id: 'astro',
        name: 'Astro',
        href: 'https://astro.build/',
        external: true,
        points: {
          fit: 'One site mixes UI frameworks',
          stack: 'Vite and islands. Vue is optional',
          build: 'Default navigation reloads the page',
          learn: 'You assemble lists, tags, feeds, and a theme',
          themes: 'Content themes, not Yun-style component overrides',
          zh: 'Official docs include Chinese',
          deploy: 'Static by default, or a server adapter',
        },
      },
    ],
  },
  zh: {
    all: '全部',
    groupLabel: '对比这些框架',
    facetGroup: '比较的项目',
    external: '在新标签页打开',
    facets: [
      { id: 'fit', label: '适合' },
      { id: 'stack', label: '技术栈' },
      { id: 'build', label: '构建' },
      { id: 'learn', label: '上手' },
      { id: 'themes', label: '主题' },
      { id: 'zh', label: '中文' },
      { id: 'deploy', label: '部署' },
    ],
    frameworks: [
      {
        id: 'valaxy',
        name: 'Valaxy',
        href: '/zh/guide/getting-started',
        points: {
          fit: 'Vue 博客，或能接受新主题时从 Hexo 迁出',
          stack: 'Vue 3、Vite、带类型的配置',
          build: '热更新。先 SSG，再站内跳转',
          learn: '写 Vue 就从 `pnpm create valaxy` 开始',
          themes: 'Yun、Press 和插件。按组件覆盖',
          zh: '完整 `/zh/` 文档，以及 Hexo 迁移指南',
          deploy: '静态 `dist/`',
        },
      },
      {
        id: 'hexo',
        name: 'Hexo',
        href: 'https://hexo.io/',
        external: true,
        points: {
          fit: '仅当某个 Hexo 主题或插件就是产品',
          stack: 'Node.js、Markdown、`_config.yml`',
          build: '生成后再刷新',
          learn: '只挑选现成主题、并且不写 Vue 时最短',
          themes: '中文目录最大。这些主题不能在 Valaxy 上跑',
          zh: '中文文档和社区是默认状态',
          deploy: '静态 `public/`',
        },
      },
      {
        id: 'vitepress',
        name: 'VitePress',
        href: 'https://vitepress.dev/',
        external: true,
        points: {
          fit: '库或产品手册，不需要博客文章模型',
          stack: 'Vue 3、Vite、Markdown',
          build: '面向文档预览的 Vite',
          learn: '默认文档主题门槛较低',
          themes: '文档主题。文章、标签和 RSS 不是产品',
          zh: '官方文档包含中文',
          deploy: '静态产物',
        },
      },
      {
        id: 'hugo',
        name: 'Hugo',
        href: 'https://gohugo.io/',
        external: true,
        points: {
          fit: 'Go 工具链比 Vue 组件更重要',
          stack: 'Go 单二进制和 Go 模板',
          build: '很快。这里不与 Valaxy 比耗时',
          learn: '学的是模板和内容模型，不是 Vue',
          themes: '站点主题很多，不是 Vue 组件主题',
          zh: '文档以英文为主',
          deploy: '静态 `public/`',
        },
      },
      {
        id: 'astro',
        name: 'Astro',
        href: 'https://astro.build/',
        external: true,
        points: {
          fit: '一个站点要混用多种 UI 框架',
          stack: 'Vite 与群岛架构。Vue 可选',
          build: '默认导航会整页重载',
          learn: '列表、标签、订阅和主题要自己组装',
          themes: '有内容主题，不是 Yun 那种组件覆盖',
          zh: '官方文档包含中文',
          deploy: '默认可静态，也可以接服务器适配器',
        },
      },
    ],
  },
} satisfies Record<'en' | 'zh', ChooseCompareCopy>
