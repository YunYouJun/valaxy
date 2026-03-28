import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'

// Mock useThemeConfig before importing the composable
const mockTypes = ref<Record<string, { color: string, icon: string }>>({
  link: { color: '#0078e7', icon: 'i-ri-link' },
  post: { color: '#ff5722', icon: 'i-ri-article-line' },
  note: { color: '#4caf50', icon: 'i-ri-sticky-note-line' },
})

vi.mock('../../packages/valaxy-theme-yun/composables/config', () => ({
  useThemeConfig: () => computed(() => ({ types: mockTypes.value })),
}))

// Must import after mock setup
const { usePostProperty } = await import('../../packages/valaxy-theme-yun/composables/post')

describe('usePostProperty', () => {
  it('returns empty values when type is undefined', () => {
    const { color, icon, styles } = usePostProperty()
    expect(color.value).toBe('')
    expect(icon.value).toBe('')
    expect(styles.value).toBeUndefined()
  })

  it('returns correct values for a known type', () => {
    const { color, icon, styles } = usePostProperty('post')
    expect(color.value).toBe('#ff5722')
    expect(icon.value).toBe('i-ri-article-line')
    expect(styles.value).toEqual({ '--card-c-primary': '#ff5722' })
  })

  it('falls back to link type for unknown types', () => {
    const { color, icon } = usePostProperty('unknown-type')
    expect(color.value).toBe('#0078e7')
    expect(icon.value).toBe('i-ri-link')
  })

  it('reacts to type changes (ref)', async () => {
    const type = ref<string | undefined>('post')
    const { color, icon } = usePostProperty(type)

    expect(color.value).toBe('#ff5722')
    expect(icon.value).toBe('i-ri-article-line')

    type.value = 'note'
    await nextTick()
    expect(color.value).toBe('#4caf50')
    expect(icon.value).toBe('i-ri-sticky-note-line')

    type.value = undefined
    await nextTick()
    expect(color.value).toBe('')
    expect(icon.value).toBe('')
  })

  it('reacts to type changes (getter)', async () => {
    const type = ref<string>('post')
    const { color } = usePostProperty(() => type.value)

    expect(color.value).toBe('#ff5722')

    type.value = 'note'
    await nextTick()
    expect(color.value).toBe('#4caf50')
  })

  it('reacts to themeConfig changes', async () => {
    const { color } = usePostProperty('post')
    expect(color.value).toBe('#ff5722')

    mockTypes.value = {
      ...mockTypes.value,
      post: { color: '#9c27b0', icon: 'i-ri-edit-line' },
    }
    await nextTick()
    expect(color.value).toBe('#9c27b0')

    // Restore
    mockTypes.value = {
      link: { color: '#0078e7', icon: 'i-ri-link' },
      post: { color: '#ff5722', icon: 'i-ri-article-line' },
      note: { color: '#4caf50', icon: 'i-ri-sticky-note-line' },
    }
  })
})
