export type AddonKind = 'official' | 'community'
export type AddonLocale = 'en' | 'zh-CN'

export interface LocalizedAddonText {
  'en': string
  'zh-CN': string
}

export interface ValaxyAddon {
  name: string
  author: string | readonly string[]
  icon: string
  repo: string
  kind: AddonKind
  docsPath?: string
  description: LocalizedAddonText
  tags: readonly string[]
}

export interface LocalizedValaxyAddon extends Omit<ValaxyAddon, 'author' | 'description' | 'docsPath'> {
  author: string[]
  description: string
  docs?: string
}

export const addons = [
  {
    name: 'valaxy-addon-abbrlink',
    author: 'YunYouJun',
    icon: 'i-ri-links-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-abbrlink',
    kind: 'official',
    docsPath: '/addons/official/abbrlink',
    description: {
      'en': 'Generate stable abbreviated links for posts.',
      'zh-CN': '为文章生成稳定的短链接。',
    },
    tags: ['abbrlink', 'permalink'],
  },
  {
    name: 'valaxy-addon-algolia',
    author: 'YunYouJun',
    icon: 'i-simple-icons-algolia',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-algolia',
    kind: 'official',
    docsPath: '/addons/official/algolia',
    description: {
      'en': 'Add Algolia DocSearch to a Valaxy site.',
      'zh-CN': '为 Valaxy 站点接入 Algolia DocSearch。',
    },
    tags: ['search'],
  },
  {
    name: 'valaxy-addon-bangumi',
    author: ['yixiaojiu', 'YunYouJun'],
    icon: 'i-simple-icons-bilibili',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-bangumi',
    kind: 'official',
    docsPath: '/addons/official/bangumi',
    description: {
      'en': 'Display Bilibili and Bangumi watch lists in Valaxy.',
      'zh-CN': '在 Valaxy 中展示 Bilibili 与 Bangumi 追番列表。',
    },
    tags: ['video'],
  },
  {
    name: 'valaxy-addon-components',
    author: 'YunYouJun',
    icon: 'i-ri-shapes-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-components',
    kind: 'official',
    docsPath: '/addons/official/components',
    description: {
      'en': 'General-purpose Vue components and theme component resolvers for Valaxy.',
      'zh-CN': '为 Valaxy 提供通用 Vue 组件与主题组件解析器。',
    },
    tags: ['component'],
  },
  {
    name: 'valaxy-addon-feishu',
    author: 'YunYouJun',
    icon: 'i-ri-file-cloud-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-feishu',
    kind: 'official',
    docsPath: '/addons/official/feishu',
    description: {
      'en': 'Fetch Feishu or Lark documents as Valaxy content.',
      'zh-CN': '将飞书或 Lark 文档转换为 Valaxy 内容。',
    },
    tags: ['cms', 'feishu'],
  },
  {
    name: 'valaxy-addon-girls',
    author: 'YunYouJun',
    icon: 'i-ri-group-2-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-girls',
    kind: 'official',
    docsPath: '/addons/girls',
    description: {
      'en': 'A responsive character gallery with local or remote data sources.',
      'zh-CN': '支持本地或远程数据源的响应式角色收藏画廊。',
    },
    tags: ['component', 'gallery'],
  },
  {
    name: 'valaxy-addon-lightgallery',
    author: 'YunYouJun',
    icon: 'i-ri-gallery-view-2',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-lightgallery',
    kind: 'official',
    docsPath: '/addons/official/lightgallery',
    description: {
      'en': 'LightGallery-powered image previews for Valaxy.',
      'zh-CN': '为 Valaxy 提供基于 LightGallery 的图片预览。',
    },
    tags: ['image'],
  },
  {
    name: 'valaxy-addon-meting',
    author: ['YunYouJun', 'yixiaojiu'],
    icon: 'i-ri-disc-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-meting',
    kind: 'official',
    docsPath: '/addons/official/meting',
    description: {
      'en': 'A global music player based on APlayer and MetingJS.',
      'zh-CN': '基于 APlayer 和 MetingJS 的全局音乐播放器。',
    },
    tags: ['music'],
  },
  {
    name: 'valaxy-addon-twikoo',
    author: 'YunYouJun',
    icon: 'i-ri-message-3-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-twikoo',
    kind: 'official',
    docsPath: '/addons/official/twikoo',
    description: {
      'en': 'Integrate the Twikoo comment system with Valaxy themes.',
      'zh-CN': '为 Valaxy 主题集成 Twikoo 评论系统。',
    },
    tags: ['comment'],
  },
  {
    name: 'valaxy-addon-waline',
    author: 'YunYouJun',
    icon: 'i-ri-chat-smile-3-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-addon-waline',
    kind: 'official',
    docsPath: '/addons/official/waline',
    description: {
      'en': 'Integrate the Waline comment system with Valaxy themes.',
      'zh-CN': '为 Valaxy 主题集成 Waline 评论系统。',
    },
    tags: ['comment'],
  },
  {
    name: 'valaxy-addon-live2d',
    author: 'WRXinYue',
    icon: 'i-ri-bear-smile-line',
    repo: 'https://github.com/valaxyjs/valaxy-addon-live2d',
    kind: 'community',
    description: {
      'en': 'Add a Live2D mascot component to Valaxy.',
      'zh-CN': '为 Valaxy 添加 Live2D 看板娘组件。',
    },
    tags: ['magic'],
  },
  {
    name: 'valaxy-addon-git-log',
    author: 'WRXinYue',
    icon: 'i-ri-git-branch-line',
    repo: 'https://github.com/valaxyjs/valaxy-addon-git-log',
    kind: 'community',
    description: {
      'en': 'Integrate Git logs into pages on a Valaxy site.',
      'zh-CN': '将 Git 日志集成到 Valaxy 站点页面中。',
    },
    tags: ['git-log'],
  },
  {
    name: 'valaxy-addon-hitokoto',
    author: 'WRXinYue',
    icon: 'i-ri-double-quotes-l',
    repo: 'https://github.com/valaxyjs/valaxy-addon-hitokoto',
    kind: 'community',
    description: {
      'en': 'Use the Hitokoto API through a Valaxy Composition API.',
      'zh-CN': '通过 Valaxy Composition API 使用一言服务。',
    },
    tags: ['hitokoto'],
  },
  {
    name: 'valaxy-addon-vercount',
    author: 'WRXinYue',
    icon: 'i-ri-bar-chart-box-line',
    repo: 'https://github.com/valaxyjs/valaxy-addon-vercount',
    kind: 'community',
    description: {
      'en': 'A Vercount-based visitor counter and Busuanzi alternative.',
      'zh-CN': '基于 Vercount 的访问计数插件，可替代不蒜子。',
    },
    tags: ['busuanzi', 'vercount'],
  },
  {
    name: 'valaxy-addon-face',
    author: 'qtqz',
    icon: 'i-ri-emotion-happy-line',
    repo: 'https://github.com/qtqz/my-valaxy-addons/tree/main/valaxy-addon-face',
    kind: 'community',
    description: {
      'en': 'Use stickers in Valaxy articles.',
      'zh-CN': '在 Valaxy 文章中使用表情包。',
    },
    tags: ['emoji', 'sticker'],
  },
  {
    name: 'valaxy-addon-food-map',
    author: 'CacheTide',
    icon: 'i-ri-restaurant-2-line',
    repo: 'https://github.com/CacheTide/valaxy-addon-food-map',
    kind: 'community',
    description: {
      'en': 'Build food maps from Markdown frontmatter and shared JSON.',
      'zh-CN': '从 Markdown Frontmatter 和共享 JSON 生成美食地图。',
    },
    tags: ['food', 'map'],
  },
  {
    name: 'valaxy-addon-giscus',
    author: 'CNskarin',
    icon: 'i-ri-chat-3-line',
    repo: 'https://github.com/CNskarin/valaxy-addon-giscus',
    kind: 'community',
    description: {
      'en': 'Giscus comment system for Valaxy, powered by GitHub Discussions.',
      'zh-CN': '为 Valaxy 集成 Giscus 评论系统（GitHub Discussions 驱动）。',
    },
    tags: ['comment', 'giscus'],
  },
] satisfies readonly ValaxyAddon[]

export const officialAddons = addons.filter(addon => addon.kind === 'official')

export function normalizeAddonLocale(locale: string): AddonLocale {
  return locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

export function getAddonDocsPath(addon: ValaxyAddon, locale: string): string | undefined {
  if (!addon.docsPath)
    return undefined

  return normalizeAddonLocale(locale) === 'zh-CN'
    ? `/zh${addon.docsPath}`
    : addon.docsPath
}

export function localizeAddon(addon: ValaxyAddon, locale: string): LocalizedValaxyAddon {
  const normalizedLocale = normalizeAddonLocale(locale)
  const { author, description, docsPath: _docsPath, ...rest } = addon

  return {
    ...rest,
    author: Array.isArray(author) ? [...author] : [author],
    description: description[normalizedLocale],
    docs: getAddonDocsPath(addon, normalizedLocale),
  }
}
