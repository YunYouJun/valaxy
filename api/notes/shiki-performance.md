# Shiki 高亮耗时问题

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
import {
  bundledLanguages,
  type DynamicImportLanguageRegistration,
  type LanguageRegistration,
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
