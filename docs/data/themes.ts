export type ThemeKind = 'official' | 'community'
export type ThemeLocale = 'en' | 'zh-CN'

export interface LocalizedThemeText {
  'en': string
  'zh-CN': string
}

export interface ValaxyTheme {
  name: string
  icon: string
  repo: string
  kind: ThemeKind
  docsPath?: string
  description: LocalizedThemeText
  siteImage: string
  siteExampleUrl?: string
  tags: readonly string[]
}

export interface LocalizedValaxyTheme extends Omit<ValaxyTheme, 'description' | 'docsPath'> {
  description: string
  docs?: string
}

export const themes = [
  {
    name: 'valaxy-theme-yun',
    icon: 'i-ri-cloud-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-yun',
    kind: 'official',
    docsPath: '/themes/yun',
    description: {
      'en': 'The default personal blog theme for Valaxy.',
      'zh-CN': 'Valaxy 默认的个人博客主题。',
    },
    siteImage: 'https://s2.loli.net/2023/05/05/QoK4ZimqN3fgRdD.png',
    siteExampleUrl: 'https://www.yunyoujun.cn',
    tags: ['yun', 'blog', 'light'],
  },
  {
    name: 'valaxy-theme-press',
    icon: 'i-ri-book-open-line',
    repo: 'https://github.com/YunYouJun/valaxy/tree/main/packages/valaxy-theme-press',
    kind: 'official',
    docsPath: '/themes/press',
    description: {
      'en': 'The official documentation theme for Valaxy.',
      'zh-CN': 'Valaxy 官方的文档主题。',
    },
    siteImage: 'https://s2.loli.net/2023/05/05/1DyEudpohIl47cP.png',
    siteExampleUrl: 'https://valaxy.site/',
    tags: ['docs', 'press'],
  },
  {
    name: 'valaxy-theme-starter',
    icon: 'i-ri-seedling-line',
    repo: 'https://github.com/valaxyjs/valaxy-theme-starter',
    kind: 'official',
    description: {
      'en': 'The official starter template for creating a Valaxy theme.',
      'zh-CN': '用于创建 Valaxy 主题的官方起始模板。',
    },
    siteImage: 'https://s2.loli.net/2023/10/06/viHCdNlQn2KZzEq.png',
    siteExampleUrl: 'https://starter.valaxy.site/',
    tags: ['starter', 'template'],
  },
  {
    name: 'valaxy-theme-gitlink',
    icon: 'i-ri-git-repository-line',
    repo: 'https://github.com/valaxyjs/valaxy-theme-gitlink',
    kind: 'official',
    description: {
      'en': 'A compact link-focused homepage theme for Valaxy.',
      'zh-CN': '一款紧凑、以链接展示为核心的 Valaxy 首页主题。',
    },
    siteImage: 'https://s2.loli.net/2023/10/06/xJf8nHBQNFybpag.png',
    siteExampleUrl: 'https://gitlink.valaxy.site/',
    tags: ['home', 'gitlink'],
  },
  {
    name: 'valaxy-theme-hairy',
    icon: 'i-ri-bear-smile-line',
    repo: 'https://github.com/hairyf/valaxy-theme-hairy',
    kind: 'community',
    description: {
      'en': 'A clean personal blog theme created by Hairy.',
      'zh-CN': '由 Hairy 打造的简洁个人博客主题。',
    },
    siteImage: 'https://raw.githubusercontent.com/hairyf/valaxy-theme-hairy/main/public/preview.png',
    tags: ['hairy', 'blog'],
  },
  {
    name: 'valaxy-theme-sakura',
    icon: 'i-ri-flower-line',
    repo: 'https://github.com/wrxinyue/valaxy-theme-sakura',
    kind: 'community',
    description: {
      'en': 'A simple, personalized, and cute anime-style blog theme.',
      'zh-CN': '一款简洁、个性化且可爱的动漫风博客主题。',
    },
    siteImage: 'https://common.s3.bitiful.net/valaxy%2Fvalaxy-theme-sakura.png',
    siteExampleUrl: 'https://sakura.wrxinyue.org/',
    tags: ['blog', 'sakura', 'light'],
  },
  {
    name: 'valaxy-theme-oceanus',
    icon: 'i-ri-drop-line',
    repo: 'https://github.com/wrxinyue/valaxy-theme-oceanus',
    kind: 'community',
    description: {
      'en': 'A simple and elegant documentation theme for Valaxy.',
      'zh-CN': '一款简洁优雅的 Valaxy 文档主题。',
    },
    siteImage: 'https://common.s3.bitiful.net/valaxy%2Fvalaxy-theme-oceanus.png',
    siteExampleUrl: 'https://oceanus.wrxinyue.org/',
    tags: ['docs', 'oceanus'],
  },
  {
    name: 'valaxy-theme-antfu',
    icon: 'i-ri-brush-line',
    repo: 'https://github.com/wrxinyue/valaxy-theme-antfu',
    kind: 'community',
    description: {
      'en': 'A Valaxy port of the theme used by antfu.me.',
      'zh-CN': '移植自 antfu.me 的 Valaxy 主题。',
    },
    siteImage: 'https://common.s3.bitiful.net/valaxy%2Fvalaxy-theme-antfu.png',
    siteExampleUrl: 'https://antfu.wrxinyue.org/',
    tags: ['blog', 'antfu', 'dark'],
  },
  {
    name: 'valaxy-theme-shuimo',
    icon: 'i-ri-quill-pen-line',
    repo: 'https://github.com/JobinJia/valaxy-theme-shuimo',
    kind: 'community',
    description: {
      'en': 'A Chinese ink-wash style theme for Valaxy.',
      'zh-CN': '一款具有中国水墨风格的 Valaxy 主题。',
    },
    siteImage: 'https://raw.githubusercontent.com/JobinJia/valaxy-theme-shuimo/main/screenshots/preview-light.png',
    siteExampleUrl: 'https://jobinjia.com/',
    tags: ['blog', 'shuimo', 'chinese', 'ink-wash'],
  },
  {
    name: 'valaxy-theme-lolimeow',
    icon: 'i-ri-magic-line',
    repo: 'https://github.com/Yoyo-514/valaxy-theme-lolimeow',
    kind: 'community',
    description: {
      'en': 'A soft anime-style blog theme for Valaxy.',
      'zh-CN': '一款柔和的动漫风 Valaxy 博客主题。',
    },
    siteImage: 'https://raw.githubusercontent.com/Yoyo-514/valaxy-theme-lolimeow/main/public/images/example.png',
    siteExampleUrl: 'https://lolimeow.yoyo514.top/',
    tags: ['blog', 'anime', 'lolimeow', 'light'],
  },
] satisfies readonly ValaxyTheme[]

export function normalizeThemeLocale(locale: string): ThemeLocale {
  return locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

export function getThemeDocsPath(theme: ValaxyTheme, locale: string): string | undefined {
  if (!theme.docsPath)
    return undefined

  return normalizeThemeLocale(locale) === 'zh-CN'
    ? `/zh${theme.docsPath}`
    : theme.docsPath
}

export function localizeTheme(theme: ValaxyTheme, locale: string): LocalizedValaxyTheme {
  const normalizedLocale = normalizeThemeLocale(locale)
  const { description, docsPath: _docsPath, ...rest } = theme

  return {
    ...rest,
    description: description[normalizedLocale],
    docs: getThemeDocsPath(theme, normalizedLocale),
  }
}
