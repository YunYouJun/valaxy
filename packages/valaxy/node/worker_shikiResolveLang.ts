import type { DynamicImportLanguageRegistration, LanguageRegistration } from 'shiki'
/**
 * 2024-12-14 ref vitepress
 */
import {
  bundledLanguages,

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
