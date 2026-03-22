import { describe, expect, it } from 'vitest'
import { findTaxonomyI18nIssues, resolveTaxonomyI18nValidationLevel } from '../packages/valaxy/node/modules/taxonomy-i18n'

describe('taxonomy i18n validation', () => {
  it('defaults to warn level', () => {
    expect(resolveTaxonomyI18nValidationLevel({
      config: {
        build: {},
      },
    } as any)).toBe('warn')
  })

  it('supports off level', () => {
    expect(resolveTaxonomyI18nValidationLevel({
      config: {
        build: {
          taxonomyI18n: {
            level: 'off',
          },
        },
      },
    } as any)).toBe('off')
  })

  it('supports error level', () => {
    expect(resolveTaxonomyI18nValidationLevel({
      config: {
        build: {
          taxonomyI18n: {
            level: 'error',
          },
        },
      },
    } as any)).toBe('error')
  })

  it('warns when explicit $locale key is missing in some languages', () => {
    const issues = findTaxonomyI18nIssues(
      [
        {
          namespace: 'tag',
          rawValue: '$locale:tag.notes',
          files: ['pages/posts/hello.md'],
        },
      ],
      {
        'zh-CN': { tag: { notes: '笔记' } },
        'en': {},
      },
      ['zh-CN', 'en'],
    )

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      type: 'explicit-locale-key-missing',
      localeKey: 'tag.notes',
      missingLanguages: ['en'],
      presentLanguages: ['zh-CN'],
    })
  })

  it('does not warn when a raw term has no translations at all', () => {
    const issues = findTaxonomyI18nIssues(
      [
        {
          namespace: 'tag',
          rawValue: 'notes',
          files: ['pages/posts/hello.md'],
        },
      ],
      {
        'zh-CN': {},
        'en': {},
      },
      ['zh-CN', 'en'],
    )

    expect(issues).toEqual([])
  })

  it('warns when only some languages define translations for a raw term', () => {
    const issues = findTaxonomyI18nIssues(
      [
        {
          namespace: 'category',
          rawValue: 'test',
          files: ['pages/posts/hello.md'],
        },
      ],
      {
        'zh-CN': { category: { test: '测试' } },
        'en': {},
      },
      ['zh-CN', 'en'],
    )

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      type: 'partial-locale-coverage',
      localeKey: 'category.test',
      missingLanguages: ['en'],
      presentLanguages: ['zh-CN'],
    })
  })

  it('does not warn when a raw term is translated in all languages', () => {
    const issues = findTaxonomyI18nIssues(
      [
        {
          namespace: 'tag',
          rawValue: 'notes',
          files: ['pages/posts/hello.md'],
        },
      ],
      {
        'zh-CN': { tag: { notes: '笔记' } },
        'en': { tag: { notes: 'Notes' } },
      },
      ['zh-CN', 'en'],
    )

    expect(issues).toEqual([])
  })
})
