import type { CategoryList } from '../../packages/valaxy/client/composables/category-utils'
import type { Post } from '../../packages/valaxy/types/posts'
import { describe, expect, it } from 'vitest'
import { isCategoryList, removeItemFromCategory } from '../../packages/valaxy/client/composables/category-utils'

describe('isCategoryList', () => {
  it('should return true for a valid CategoryList with children', () => {
    const category: CategoryList = {
      name: 'Tech',
      total: 3,
      children: new Map([
        ['post-1', { path: '/posts/a', title: 'Post A' } as Post],
      ]),
    }
    expect(isCategoryList(category)).toBe(true)
  })

  it('should return true for a CategoryList with empty children Map', () => {
    const category: CategoryList = {
      name: 'Empty',
      total: 0,
      children: new Map(),
    }
    // Map is truthy even when empty
    expect(isCategoryList(category)).toBe(true)
  })

  it('should return false for a Post object (no children)', () => {
    const post: Post = {
      path: '/posts/hello',
      title: 'Hello World',
      date: '2024-01-01',
    }
    expect(isCategoryList(post)).toBe(false)
  })

  it('should return false for null', () => {
    expect(isCategoryList(null)).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isCategoryList(undefined)).toBe(false)
  })

  it('should return false for an empty object', () => {
    expect(isCategoryList({})).toBe(false)
  })

  it('should return false for primitive values', () => {
    expect(isCategoryList(42)).toBe(false)
    expect(isCategoryList('string')).toBe(false)
    expect(isCategoryList(true)).toBe(false)
  })

  it('should return false when children is not a Map (array)', () => {
    expect(isCategoryList({ name: 'Fake', total: 0, children: [] })).toBe(false)
  })

  it('should return false when children is a plain object', () => {
    expect(isCategoryList({ name: 'Fake', total: 0, children: {} })).toBe(false)
  })

  it('should return true for nested CategoryList', () => {
    const nested: CategoryList = {
      name: 'Root',
      total: 5,
      children: new Map([
        ['Sub', {
          name: 'Sub',
          total: 2,
          children: new Map(),
        } as CategoryList],
      ]),
    }
    expect(isCategoryList(nested)).toBe(true)
    expect(isCategoryList(nested.children.get('Sub'))).toBe(true)
  })
})

describe('removeItemFromCategory', () => {
  function makeCategoryList(entries: [string, Post | CategoryList][]): CategoryList {
    return {
      name: 'Root',
      total: entries.length,
      children: new Map(entries),
    }
  }

  it('should remove a direct child category by name', () => {
    const list = makeCategoryList([
      ['Frontend', { name: 'Frontend', total: 1, children: new Map() } as CategoryList],
      ['Backend', { name: 'Backend', total: 0, children: new Map() } as CategoryList],
    ])

    removeItemFromCategory(list, 'Frontend')
    expect(list.children.has('Frontend')).toBe(false)
    expect(list.children.has('Backend')).toBe(true)
  })

  it('should only remove the first segment of a slash-separated path', () => {
    const list = makeCategoryList([
      ['Tech', {
        name: 'Tech',
        total: 1,
        children: new Map([
          ['Vue', { name: 'Vue', total: 0, children: new Map() } as CategoryList],
        ]),
      } as CategoryList],
    ])

    removeItemFromCategory(list, 'Tech/Vue')
    // The first segment "Tech" is removed entirely
    expect(list.children.has('Tech')).toBe(false)
  })

  it('should not throw when removing a non-existent category name', () => {
    const list = makeCategoryList([
      ['Existing', { name: 'Existing', total: 0, children: new Map() } as CategoryList],
    ])

    expect(() => removeItemFromCategory(list, 'NonExistent')).not.toThrow()
    expect(list.children.has('Existing')).toBe(true)
  })

  it('should handle empty string category name without error', () => {
    const list = makeCategoryList([
      ['Existing', { name: 'Existing', total: 0, children: new Map() } as CategoryList],
    ])

    expect(() => removeItemFromCategory(list, '')).not.toThrow()
    // ''.split('/') returns [''], so it tries to delete key '' which doesn't exist
    expect(list.children.has('Existing')).toBe(true)
  })

  it('should handle a CategoryList with no children entries', () => {
    const list = makeCategoryList([])
    expect(() => removeItemFromCategory(list, 'anything')).not.toThrow()
  })
})
