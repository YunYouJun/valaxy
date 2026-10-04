# Shiki 高亮耗时问题

::: warning 旧版实现记录 · 2026-10-04 按 Valaxy 1.0 核对
本文保留早期高亮性能排查过程。按需加载语言的思路仍适用；下方的 `synckit` worker、`loadLanguageSync` 和修改 `getLanguage` 的方案已不适用于 Valaxy 1.0。

1.0 使用异步 Markdown 渲染，等待 `highlighter.loadLanguage()`，并在相同配置下复用高亮实例；无需复制同步 worker 方案。文中的 M1 Pro 启动耗时是当时的单机观察，不是当前版本基准。

当前实现可参考 [1.0 高亮代码](https://github.com/YunYouJun/valaxy/blob/v1.0.0/packages/valaxy/node/plugins/markdown/plugins/highlight.ts)和[高亮实例管理](https://github.com/YunYouJun/valaxy/blob/v1.0.0/packages/valaxy/node/plugins/markdown/highlighterCache.ts)。使用方法见 [Markdown 指南](/zh/guide/markdown)。
:::

Valaxy 使用 Shiki 实现代码高亮。

使用 `Object.keys(bundledLanguages)` 加载全部语言时将使得冷启动时间更久（在 M1 Pro 下增加了约 3s）。

此时应当使用按需加载配置。

> [Bundles](https://shiki.style/guide/bundles)

```ts {18}
const highlighter = await createHighlighter({
  themes:
      typeof theme === 'object' && 'light' in theme && 'dark' in theme
        ? [theme.light, theme.dark]
        : [theme],
  langs: [
    // load long time, about 3s
    // ...Object.keys(bundledLanguages),
    ...(options.languages || []),
    ...Object.values(options.languageAlias || {}),
  ],
  langAlias: options.languageAlias,
})

// ref vitepress
// 使用 worker 按需加载语言
const resolveLangSync = createSyncFn<ShikiResolveLang>(
  require.resolve('valaxy/dist/node/worker_shikiResolveLang.js'),
)

function loadLanguage(name: string | LanguageRegistration) {
  const lang = typeof name === 'string' ? name : name.name
  if (
    !isSpecialLang(lang)
    && !highlighter.getLoadedLanguages().includes(lang)
  ) {
    const resolvedLang = resolveLangSync(lang)
    if (resolvedLang.length)
      highlighter.loadLanguageSync(resolvedLang)
    else return false
  }
  return true
}

const internal = highlighter.getInternalContext()
const getLanguage = internal.getLanguage
internal.getLanguage = (name) => {
  loadLanguage(name)
  return getLanguage.call(internal, name)
}
```

预先打包 `worker_shikiResolveLang.ts` 为 JS 以便调用。

```ts [worker_shikiResolveLang.ts]
import type { DynamicImportLanguageRegistration, LanguageRegistration } from 'shiki'
import {
  bundledLanguages

} from 'shiki'
import { runAsWorker } from 'synckit'

async function resolveLang(lang: string) {
  return (
    (
      bundledLanguages as Record<
        string,
        DynamicImportLanguageRegistration | undefined
      >
    )[lang]?.()
      .then(m => m.default) || ([] as LanguageRegistration[])
  )
}

runAsWorker(resolveLang)

export type ShikiResolveLang = typeof resolveLang
```

```ts [markdown/plugins/highlight.ts]
// 加载对应语言，若无则 fallback to defaultLang 'txt'
if (!loadLanguage(lang)) {
  logger.warn(
    c.yellow(
      `\nThe language '${lang}' is not loaded, falling back to '${defaultLang}' for syntax highlighting.`,
    ),
  )
  lang = defaultLang
}
```

## Shiki v3

> https://github.com/shikijs/shiki/issues/952

使用内置的 `highlighter.loadLanguage`
