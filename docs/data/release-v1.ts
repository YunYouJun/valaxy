import pkg from '../../packages/valaxy/package.json'

export type ReleaseLocale = 'en' | 'zh'
export const releaseVersion = pkg.version
export const releaseIsPreview = releaseVersion.includes('-')

export const releaseCopies = {
  zh: {
    lang: 'zh-CN',
    nav: { skip: '跳至主要内容' },
    devtools: {
      title: ['专注创作。', '其余，一目了然。'],
      description: '从文章整理到站点配置，Valaxy DevTools 把日常打理博客的工具，放进一个直观的面板。让创作，更从容。',
      link: '探索 Valaxy DevTools',
      preview: '文章管理，当前版本实机预览',
      alt: 'Valaxy DevTools 文章管理面板，左侧浏览文章，右侧编辑标题、日期、分类与标签',
      image: '/release/devtools-zh-preview.webp',
      darkImage: '/release/devtools-zh-dark-preview.webp',
      features: [
        { title: '文章，井然有序。', text: '搜索文章、筛选草稿，直观编辑标题、分类与标签。让每一篇内容，都各得其所。' },
        { title: '配置，直观可见。', text: '在可视化面板中调整站点与框架配置，保存回本地源文件。熟悉的配置，多一种打开方式。' },
        { title: '调试，紧随页面。', text: '查看当前页面的路由、Frontmatter 与响应式断点。页面切换，调试信息随之更新。' },
      ],
      note: '随开发模式开启，在 Vite DevTools 中打开。生产构建不包含开发工具。',
    },
    hero: { title: ['为书写而生。', '向自由而进。'], replay: '重播开场动画', plate: '图版一：文字星系', postcardOpen: '把这句话做成明信片', postcard: { title: '来自文字星系的明信片', to: '寄往：文字星系，第三旋臂', from: '寄自地球', office: '星际邮局', catalog: '星表编号', download: '下载明信片', share: '分享', close: '关闭', alt: '明信片：' }, wishLabel: '写一句话，放进星系', wishPlaceholder: '今天也想写点什么', wishSubmit: '放进星系', wishAdded: '{n} 个字已加入星系', galaxy: '由文字组成的旋涡星系，中心浮现 V 形星座', description: '用 Markdown 记录，用 Vue 创造。', primary: '开始创作', secondary: '查看 1.0 更新', hello: '你好，世界。', story: '把日常写成故事，让灵感自由生长。' },
    writing: { title: ['从一行文字，', '到你的整个世界。'], type: { label: '写下一个标题', placeholder: '你好，世界。', submit: '排版并印刷', printed: '第 {n} 次印刷，印于 {date}', tray: '字盘：反向铸造的铅字' }, description: '在熟悉的 Markdown 中书写，需要时加入一个 Vue 组件。文字、交互与想象，在同一篇文章里相遇。', link: '探索 Markdown 扩展' },
    themes: { title: ['同样的内容。', '不同的你。'], docs: '主题文档', orrery: 'Valaxy 主题行星仪：选择一颗行星，切换到对应主题', description: 'Yun，安放你的日常；Press，让知识井然有序。再用自己的组件、布局与样式，写下个性。', live: '打开实际示例', more: '探索主题与自定义' },
    engine: { title: ['轻盈的背后，', '是更坚实的内核。'], description: '1.0，把探索沉淀为清晰的构建路径。从写下文字，到静态页面，每一步都各司其职。', pipeline: ['书写内容', '渲染组件', '发布页面'], features: [
      { title: 'Vite 8 + Rolldown', text: '更新构建底座，保留熟悉的热更新体验。修改文章、配置与组件，预览随之更新。', href: '/guide/features#hot-reloading', action: '了解开发体验' },
      { title: '单一 SSG 引擎', text: '内置 Vue SSR 与纯字符串渲染，移除旧的 JSDOM 链路。首屏样式由 FOUC guard 守护。', href: '/migration/version#ssg-remove-vite-ssg', action: '查看引擎变化' },
      { title: '统一异步 Markdown', text: '页面、摘要、搜索与 RSS 共用异步渲染语义，让内容在不同出口保持一致。', href: '/guide/markdown', action: '了解 Markdown' },
    ], addonsTitle: '想要更多，按需添上。', addonsText: '评论、搜索、相册、音乐和小随想，由插件接力。1.0 将音乐播放器移至 Meting 插件，让扩展拥有自己的位置。', addonsAction: '浏览官方插件', migration: '从旧版升级？查看完整迁移指南', requirements: 'Node.js ≥ 22.12.0；移除 --ssg-engine；音乐播放器迁移至插件。' },
    closing: { title: ['下一篇，', '由你开始。'], description: '一个命令，开启你的创作空间。', action: '打开快速上手', copy: '复制命令', copied: '已复制', failed: '请选中命令手动复制', preview: '1.0 发布预览', stable: '1.0 正式版', status: '当前代码版本', community: '从 2022 年出发，与每一位贡献者共同创造。' },
  },
  en: {
    lang: 'en',
    nav: { skip: 'Skip to content' },
    devtools: {
      title: ['Keep creating.', 'See the whole picture.'],
      description: 'From organizing posts to configuring your site, Valaxy DevTools brings your everyday blog tools into one clear panel. More room to focus on your next idea.',
      link: 'Explore Valaxy DevTools',
      preview: 'Post management, previewed from the current version',
      alt: 'Valaxy DevTools with a post list on the left and title, date, category, and tag fields on the right',
      image: '/release/devtools-en-preview.webp',
      darkImage: '/release/devtools-en-dark-preview.webp',
      features: [
        { title: 'Every post in its place.', text: 'Search posts, filter drafts, and edit titles, categories, and tags visually. Keep your growing collection of stories organized.' },
        { title: 'Your settings, in sight.', text: 'Adjust site and framework settings in a visual panel, then save them to your local source files. A new way into familiar configuration.' },
        { title: 'Debug as you browse.', text: 'Inspect the current page’s route, frontmatter, and responsive breakpoints. As you navigate, the details follow along.' },
      ],
      note: 'Available in development through Vite DevTools. Excluded from production builds.',
    },
    hero: { title: ['Made for words.', 'Built for freedom.'], replay: 'Replay the intro', plate: 'Plate I: a galaxy of words', postcardOpen: 'Make it a postcard', postcard: { title: 'A postcard from the galaxy of words', to: 'To: the galaxy of words, third arm', from: 'From Earth,', office: 'INTERSTELLAR POST', catalog: 'Catalog No.', download: 'Download postcard', share: 'Share', close: 'Close', alt: 'Postcard: ' }, wishLabel: 'Write a line into the galaxy', wishPlaceholder: 'Something you want to write today', wishSubmit: 'Send it', wishAdded: '{n} characters joined the galaxy', galaxy: 'A spiral galaxy made of words, with a V-shaped constellation at its core', description: 'Write with Markdown. Create with Vue.', primary: 'Start creating', secondary: 'Explore 1.0', hello: 'Hello, world.', story: 'Turn everyday moments into stories. Give ideas room to grow.' },
    writing: { title: ['From a line of text.', 'To a world of your own.'], type: { label: 'Write a title', placeholder: 'Hello, world.', submit: 'Set and print', printed: 'Printing no. {n}, {date}', tray: 'Type case of reversed lead sorts' }, description: 'Write in familiar Markdown. Add a Vue component when you need one. Words, interaction, and imagination come together in the same post.', link: 'Explore Markdown extensions' },
    themes: { title: ['The same words.', 'A different you.'], docs: 'Theme docs', orrery: 'Valaxy theme orrery: choose a planet to switch to that theme', description: 'Yun for everyday stories. Press for organized knowledge. Make either your own with custom components, layouts, and styles.', live: 'Open live example', more: 'Explore themes and customization' },
    engine: { title: ['Light on the surface.', 'Solid at the core.'], description: '1.0 turns exploration into a focused build pipeline. From the words you write to the pages you publish, every step has a purpose.', pipeline: ['Write content', 'Render components', 'Publish pages'], features: [
      { title: 'Vite 8 + Rolldown', text: 'An updated build foundation with familiar hot reloading. Preview changes to posts, configuration, and components as you work.', href: '/guide/features#hot-reloading', action: 'Explore the workflow' },
      { title: 'One SSG engine', text: 'Built-in Vue SSR and pure string rendering replace the legacy JSDOM pipeline. A FOUC guard protects initial page styling.', href: '/migration/version#ssg-legacy-vite-ssg-engine-removed', action: 'See engine changes' },
      { title: 'Async Markdown, unified', text: 'Pages, excerpts, search, and RSS share async rendering semantics, keeping your content consistent across outputs.', href: '/guide/markdown', action: 'Explore Markdown' },
    ], addonsTitle: 'More possibilities. Your choice.', addonsText: 'Comments, search, galleries, music, and moments are a plugin away. In 1.0, the music player moves into the dedicated Meting addon.', addonsAction: 'Explore official addons', migration: 'Upgrading? Read the complete migration guide', requirements: 'Node.js ≥ 22.12.0; --ssg-engine removed; the music player moves to an addon.' },
    closing: { title: ['Your next story.', 'Starts with you.'], description: 'One command. A space to call your own.', action: 'Get started', copy: 'Copy command', copied: 'Copied', failed: 'Select the command to copy it manually', preview: '1.0 release preview', stable: '1.0 stable release', status: 'Current source version', community: 'Since 2022. Built with every contributor along the way.' },
  },
}
export type ReleaseCopy = typeof releaseCopies[ReleaseLocale]
