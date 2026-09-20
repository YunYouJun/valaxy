import { expect, it } from 'vitest'
import { filterApiGroups } from '../../packages/valaxy-theme-press/utils/api-index'

it('filters symbols and categories without mutating navigation', () => {
  const groups = [{ title: 'Client APIs', items: [{ text: 'useConfig()', link: '/api/client/functions/useConfig' }] }, { title: 'Node APIs', items: [{ text: 'defineConfig()', link: '/api/node/variables/defineConfig' }] }]
  expect(filterApiGroups(groups, 'CLIENT config')).toEqual([groups[0]])
  expect(filterApiGroups(groups, 'no-such-symbol')).toEqual([])
  expect(filterApiGroups(groups, '')).toEqual(groups)
  expect(groups).toHaveLength(2)
})

it('combines the module selection with name search and preserves distinct re-exports', () => {
  const groups = ['client', 'node'].map(module => ({ module, title: 'Functions', items: [{ text: 'useConfig', link: `/api/${module}/useConfig` }] }))
  expect(filterApiGroups(groups, 'config', 'node')).toEqual([groups[1]])
  expect(filterApiGroups(groups, 'client config')).toEqual([groups[0]])
  expect(filterApiGroups(groups, 'config')).toHaveLength(2)
})
