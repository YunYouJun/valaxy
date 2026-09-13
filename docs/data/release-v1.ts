import pkg from '../../packages/valaxy/package.json'

export type ReleaseLocale = 'en' | 'zh'
export const releaseVersion = pkg.version
export const releaseIsPreview = releaseVersion.includes('-')

export const releaseCopies = {
  zh: {
    lang: 'zh-CN',
    nav: { skip: '跳至主要内容' },
    hero: { title: ['为书写而生。', '向自由而进。'], description: '用 Markdown 记录，用 Vue 创造。', primary: '开始创作', secondary: '查看 1.0 更新', note: '从第一篇文章，到属于你的整个世界。', hello: '你好，世界。', story: '把日常写成故事，让灵感自由生长。', preview: '博客效果示意' },
    writing: { title: ['从一行文字，', '到你的整个世界。'], description: '在熟悉的 Markdown 中书写，需要时加入一个 Vue 组件。文字、交互与想象，在同一篇文章里相遇。', modes: ['Markdown', 'Vue 组件'], source: '源文件', preview: '实时示例', hello: '你好，世界。', story: '这是我的第一篇文章。', count: '点击次数', reset: '重置', hint: '试着点击，让文字动起来。', link: '探索 Markdown 扩展' },
    themes: { title: ['同样的内容。', '不同的你。'], description: 'Yun，安放你的日常；Press，让知识井然有序。再用自己的组件、布局与样式，写下个性。', yun: 'Yun · 轻盈的个人博客', press: 'Press · 清晰的文档空间', live: '打开实际示例', caption: '来自当前仓库的主题预览', more: '探索主题与自定义', altYun: 'Yun 主题本地示例截图', altPress: 'Press 主题本地文档截图' },
    engine: { title: ['轻盈的背后，', '是更坚实的内核。'], description: '1.0，把探索沉淀为清晰的构建路径。从写下文字，到静态页面，每一步都各司其职。', pipeline: ['书写内容', '渲染组件', '发布页面'], features: [
      { title: 'Vite 8 + Rolldown', text: '更新构建底座，保留熟悉的热更新体验。修改文章、配置与组件，预览随之更新。', href: '/guide/features#hot-reloading', action: '了解开发体验' },
      { title: '单一 SSG 引擎', text: '内置 Vue SSR 与纯字符串渲染，移除旧的 JSDOM 链路。首屏样式由 FOUC guard 守护。', href: '/migration/version#ssg-remove-vite-ssg', action: '查看引擎变化' },
      { title: '统一异步 Markdown', text: '页面、摘要、搜索与 RSS 共用异步渲染语义，让内容在不同出口保持一致。', href: '/guide/markdown', action: '了解 Markdown' },
    ], addonsTitle: '想要更多，按需添上。', addonsText: '评论、搜索、相册、音乐和小随想，由插件接力。1.0 将音乐播放器移至 Meting 插件，让扩展拥有自己的位置。', addonsAction: '浏览官方插件', migration: '从旧版升级？查看完整迁移指南', requirements: 'Node.js ≥22.12.0 · 移除 --ssg-engine · 音乐播放器迁移至插件' },
    closing: { title: ['下一篇，', '由你开始。'], description: '一个命令，开启你的创作空间。', action: '打开快速上手', copy: '复制命令', copied: '已复制', failed: '请选中命令手动复制', preview: '1.0 发布预览', stable: '1.0 正式版', status: '当前代码版本', community: '从 2022 年出发，与每一位贡献者共同创造。' },
  },
  en: {
    lang: 'en',
    nav: { skip: 'Skip to content' },
    hero: { title: ['Made for words.', 'Built for freedom.'], description: 'Write with Markdown. Create with Vue.', primary: 'Start creating', secondary: 'Explore 1.0', note: 'From your first post to a world of your own.', hello: 'Hello, world.', story: 'Turn everyday moments into stories. Give ideas room to grow.', preview: 'Illustrative blog preview' },
    writing: { title: ['From a line of text.', 'To a world of your own.'], description: 'Write in familiar Markdown. Add a Vue component when you need one. Words, interaction, and imagination come together in the same post.', modes: ['Markdown', 'Vue component'], source: 'Source', preview: 'Live example', hello: 'Hello, world.', story: 'This is my first post.', count: 'Clicks', reset: 'Reset', hint: 'Give it a click. Bring your words to life.', link: 'Explore Markdown extensions' },
    themes: { title: ['The same words.', 'A different you.'], description: 'Yun for everyday stories. Press for organized knowledge. Make either your own with custom components, layouts, and styles.', yun: 'Yun · A personal blog', press: 'Press · A space for knowledge', live: 'Open live example', caption: 'Theme previews from the current repository', more: 'Explore themes and customization', altYun: 'Local Yun theme demo screenshot', altPress: 'Local Press documentation screenshot' },
    engine: { title: ['Light on the surface.', 'Solid at the core.'], description: '1.0 turns exploration into a focused build pipeline. From the words you write to the pages you publish, every step has a purpose.', pipeline: ['Write content', 'Render components', 'Publish pages'], features: [
      { title: 'Vite 8 + Rolldown', text: 'An updated build foundation with familiar hot reloading. Preview changes to posts, configuration, and components as you work.', href: '/guide/features#hot-reloading', action: 'Explore the workflow' },
      { title: 'One SSG engine', text: 'Built-in Vue SSR and pure string rendering replace the legacy JSDOM pipeline. A FOUC guard protects initial page styling.', href: '/migration/version#ssg-legacy-vite-ssg-engine-removed', action: 'See engine changes' },
      { title: 'Async Markdown, unified', text: 'Pages, excerpts, search, and RSS share async rendering semantics, keeping your content consistent across outputs.', href: '/guide/markdown', action: 'Explore Markdown' },
    ], addonsTitle: 'More possibilities. Your choice.', addonsText: 'Comments, search, galleries, music, and moments are a plugin away. In 1.0, the music player moves into the dedicated Meting addon.', addonsAction: 'Explore official addons', migration: 'Upgrading? Read the complete migration guide', requirements: 'Node.js ≥22.12.0 · --ssg-engine removed · Music moves to an addon' },
    closing: { title: ['Your next story.', 'Starts with you.'], description: 'One command. A space to call your own.', action: 'Get started', copy: 'Copy command', copied: 'Copied', failed: 'Select the command to copy it manually', preview: '1.0 release preview', stable: '1.0 stable release', status: 'Current source version', community: 'Since 2022. Built with every contributor along the way.' },
  },
}
export type ReleaseCopy = typeof releaseCopies[ReleaseLocale]
