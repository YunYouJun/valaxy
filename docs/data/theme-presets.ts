import type { ThemePromptLocale, ThemePromptOptions } from './theme-prompt'

/** Design briefs that can be edited before generating a theme prompt. */
export const themePresets = {
  editorial: {
    name: 'editorial',
    designSystem: 'custom',
    zh: { label: '编辑风', visualDirection: '清晰的网格、克制的留白、衬线标题与舒适的长文阅读，支持浅色和深色', features: '首页、可搜索文章列表、文章目录、普通页面、响应式导航和外观切换' },
    en: { label: 'Editorial', visualDirection: 'A clear grid, considered whitespace, serif headings and comfortable long-form reading in light and dark modes', features: 'Home, searchable posts, article outline, ordinary pages, responsive navigation and appearance switching' },
  },
  arknights: {
    name: 'arknights',
    designSystem: 'ak-ui',
    zh: { label: 'AK UI / Arknights', visualDirection: 'AK UI 的 system 风格：石墨色与冷白阅读面、黄色行动色、原创工业几何和档案式文章列表；正文保持安静、清晰', features: '首页精选文章、标题与标签筛选、归档、文章目录、代码与表格样式、关于页、深浅色切换、移动端和键盘导航' },
    en: { label: 'AK UI / Arknights', visualDirection: 'AK UI system style: graphite and cool-white reading surfaces, yellow actions, original industrial geometry and an archive-like post list; keep prose calm and legible', features: 'Featured post, title and tag filters, archive, article outline, code and table styles, about page, light/dark modes, mobile and keyboard navigation' },
  },
} as const

/** Return an editable brief for the selected design preset and language. */
export function getThemePreset(id: keyof typeof themePresets, locale: ThemePromptLocale): ThemePromptOptions {
  const preset = themePresets[id]
  return { name: preset.name, designSystem: preset.designSystem, workspace: 'starter', visualDirection: preset[locale].visualDirection, features: preset[locale].features }
}
