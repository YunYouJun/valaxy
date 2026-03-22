import type { TaxonomyNamespace } from '../../shared/utils'
import type { ResolvedValaxyOptions } from '../types'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fg from 'fast-glob'
import fs from 'fs-extra'
import yaml from 'js-yaml'
import { relative, resolve } from 'pathe'
import { hasLocaleMessage, resolveTaxonomyLocaleKey } from '../../shared/utils'
import { replaceArrMerge } from '../config/merge'
import { readPostFiles, scanPageFiles } from './utils'

export interface TaxonomyUsage {
  namespace: TaxonomyNamespace
  rawValue: string
  files: string[]
}

export interface TaxonomyI18nIssue {
  type: 'explicit-locale-key-missing' | 'partial-locale-coverage'
  namespace: TaxonomyNamespace
  rawValue: string
  localeKey: string
  presentLanguages: string[]
  missingLanguages: string[]
  files: string[]
}

function getConfiguredLanguages(options: ResolvedValaxyOptions): string[] {
  const configured = options.config.siteConfig.languages?.length
    ? options.config.siteConfig.languages
    : [options.config.siteConfig.lang || 'en']

  return [...new Set(configured.filter(Boolean))]
}

function normalizeToStringArray(value: unknown): string[] {
  if (typeof value === 'string')
    return value.trim() ? [value] : []

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean)
  }

  return []
}

async function collectPageFiles(options: ResolvedValaxyOptions): Promise<string[]> {
  const userPages = await scanPageFiles(options.userRoot, ['**/*.md'])
  const userPageFiles = userPages.map(file => resolve(options.userRoot, 'pages', file))

  const contentDir = resolve(options.tempDir, 'content', 'pages')
  if (!await fs.pathExists(contentDir))
    return userPageFiles

  const contentPages = await fg(['**/*.md'], {
    cwd: contentDir,
    ignore: ['**/node_modules'],
  })

  return [...new Set([
    ...userPageFiles,
    ...contentPages.map(file => resolve(contentDir, file)),
  ])]
}

export async function loadMergedLocaleMessages(options: ResolvedValaxyOptions): Promise<Record<string, any>> {
  const languages = getConfiguredLanguages(options)
  const messages = Object.fromEntries(languages.map(lang => [lang, {} as Record<string, any>]))

  for (const root of options.roots) {
    for (const lang of languages) {
      const localeFiles = [
        resolve(root, 'locales', `${lang}.yml`),
        resolve(root, 'locales', `${lang}.yaml`),
      ]

      for (const localeFile of localeFiles) {
        if (!await fs.pathExists(localeFile))
          continue

        const content = await fs.readFile(localeFile, 'utf-8')
        if (!content.trim())
          continue

        const data = yaml.load(content) as Record<string, any> | undefined
        messages[lang] = replaceArrMerge(data || {}, messages[lang])
      }
    }
  }

  return messages
}

export async function collectTaxonomyUsages(options: ResolvedValaxyOptions): Promise<TaxonomyUsage[]> {
  const files = await collectPageFiles(options)
  const posts = await readPostFiles(files)
  const usageMap = new Map<string, { namespace: TaxonomyNamespace, rawValue: string, files: Set<string> }>()

  const addUsage = (namespace: TaxonomyNamespace, rawValue: string, file: string) => {
    const key = `${namespace}:${rawValue}`
    if (!usageMap.has(key)) {
      usageMap.set(key, {
        namespace,
        rawValue,
        files: new Set<string>(),
      })
    }

    usageMap.get(key)!.files.add(file)
  }

  for (const post of posts) {
    const file = relative(options.userRoot, post.filePath)

    for (const tag of normalizeToStringArray(post.data.tags))
      addUsage('tag', tag, file)

    for (const category of normalizeToStringArray(post.data.categories))
      addUsage('category', category, file)
  }

  return Array.from(usageMap.values(), item => ({
    namespace: item.namespace,
    rawValue: item.rawValue,
    files: [...item.files].sort(),
  }))
    .sort((a, b) => `${a.namespace}:${a.rawValue}`.localeCompare(`${b.namespace}:${b.rawValue}`))
}

export function findTaxonomyI18nIssues(
  usages: TaxonomyUsage[],
  messages: Record<string, any>,
  languages: string[],
): TaxonomyI18nIssue[] {
  const issues: TaxonomyI18nIssue[] = []

  for (const usage of usages) {
    const { namespace, rawValue, files } = usage
    const { localeKey, isExplicitLocaleKey } = resolveTaxonomyLocaleKey(namespace, rawValue)
    const presentLanguages = languages.filter(lang => hasLocaleMessage(messages[lang], localeKey))
    const missingLanguages = languages.filter(lang => !hasLocaleMessage(messages[lang], localeKey))

    if (isExplicitLocaleKey) {
      if (missingLanguages.length) {
        issues.push({
          type: 'explicit-locale-key-missing',
          namespace,
          rawValue,
          localeKey,
          presentLanguages,
          missingLanguages,
          files,
        })
      }

      continue
    }

    if (presentLanguages.length === 0 || presentLanguages.length === languages.length)
      continue

    issues.push({
      type: 'partial-locale-coverage',
      namespace,
      rawValue,
      localeKey,
      presentLanguages,
      missingLanguages,
      files,
    })
  }

  return issues
}

function formatFiles(files: string[]): string {
  const preview = files.slice(0, 3).map(file => colors.dim(file)).join(', ')
  if (files.length <= 3)
    return preview
  return `${preview}${colors.dim(` and ${files.length - 3} more`)}`
}

export type TaxonomyI18nValidationLevel = 'off' | 'warn' | 'error'

function logTaxonomyI18nIssues(issues: TaxonomyI18nIssue[], level: Exclude<TaxonomyI18nValidationLevel, 'off'>) {
  if (!issues.length)
    return

  const log = level === 'error' ? consola.error : consola.warn
  const count = level === 'error' ? colors.red(String(issues.length)) : colors.yellow(String(issues.length))

  log(`Detected ${count} taxonomy i18n issue(s).`)

  for (const issue of issues) {
    const where = formatFiles(issue.files)

    if (issue.type === 'explicit-locale-key-missing') {
      log(
        `[taxonomy-i18n] ${colors.cyan(issue.rawValue)} is an explicit locale key `
        + `but ${colors.red(`missing in: ${issue.missingLanguages.join(', ')}`)}. `
        + `Files: ${where}`,
      )
      continue
    }

    log(
      `[taxonomy-i18n] ${colors.cyan(issue.rawValue)} resolves to ${colors.cyan(issue.localeKey)} `
      + `in ${colors.green(issue.presentLanguages.join(', '))}, `
      + `but is ${colors.red(`missing in: ${issue.missingLanguages.join(', ')}`)}. `
      + `Files: ${where}`,
    )
  }
}

export function resolveTaxonomyI18nValidationLevel(options: Pick<ResolvedValaxyOptions, 'config'>): TaxonomyI18nValidationLevel {
  return options.config.build.taxonomyI18n?.level || 'warn'
}

export async function validateTaxonomyI18n(options: ResolvedValaxyOptions): Promise<TaxonomyI18nIssue[]> {
  const level = resolveTaxonomyI18nValidationLevel(options)
  if (level === 'off')
    return []

  const languages = getConfiguredLanguages(options)
  const [messages, usages] = await Promise.all([
    loadMergedLocaleMessages(options),
    collectTaxonomyUsages(options),
  ])

  const issues = findTaxonomyI18nIssues(usages, messages, languages)
  logTaxonomyI18nIssues(issues, level)

  if (level === 'error' && issues.length)
    throw new Error(`Taxonomy i18n validation failed with ${issues.length} issue(s).`)

  return issues
}
