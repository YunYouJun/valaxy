<script lang="ts" setup>
import type { DropdownMenuItemConfig } from './YunDropdownMenu.vue'
import { useCopyMarkdown, useData, useFullUrl } from 'valaxy'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../composables'

const { copy, copied, loading, available, mdUrl } = useCopyMarkdown()
const { t } = useI18n()
const themeConfig = useThemeConfig()
const { page } = useData()
const fullUrl = useFullUrl()

const linkCopied = ref(false)

const editLinkUrl = computed(() => {
  const pattern = themeConfig.value.editLink?.pattern
  if (!pattern)
    return ''
  const relativePath = page.value?.relativePath
  if (!relativePath)
    return ''
  return pattern.replace(':path', relativePath)
})

const menuItems = computed<DropdownMenuItemConfig[]>(() => {
  const items: DropdownMenuItemConfig[] = [
    {
      key: 'copy-markdown',
      label: copied.value ? t('post.copied_markdown', 'Copied!') : t('post.copy_markdown', 'Copy Markdown'),
      icon: copied.value ? 'i-ri-check-line text-green-500' : 'i-ri-file-copy-line',
      disabled: loading.value,
    },
    {
      key: 'copy-link',
      label: linkCopied.value ? t('post.copied_markdown', 'Copied!') : t('post.copy_markdown_link', 'Copy Markdown Link'),
      icon: linkCopied.value ? 'i-ri-check-line text-green-500' : 'i-ri-link',
    },
    {
      key: 'view-markdown',
      label: t('post.view_as_markdown', 'View as Markdown'),
      icon: 'i-ri-file-text-line',
    },
  ]

  if (editLinkUrl.value) {
    items.push(
      { key: 'separator', label: '' },
      {
        key: 'edit-link',
        label: themeConfig.value.editLink?.text || t('post.open_in_github', 'Open in GitHub'),
        icon: 'i-ri-github-line',
      },
    )
  }

  return items
})

async function copyMarkdownLink() {
  try {
    const title = page.value?.frontmatter?.title || page.value?.title || 'Untitled'
    const link = `[${title}](${fullUrl.value})`
    await navigator.clipboard.writeText(link)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
  catch (err) {
    console.error('[valaxy] Failed to copy markdown link:', err)
  }
}

function onSelect(key: string) {
  switch (key) {
    case 'copy-markdown':
      copy()
      break
    case 'copy-link':
      copyMarkdownLink()
      break
    case 'view-markdown':
      window.open(mdUrl.value, '_blank')
      break
    case 'edit-link':
      if (editLinkUrl.value)
        window.open(editLinkUrl.value, '_blank')
      break
  }
}
</script>

<template>
  <div v-if="available" class="yun-post-actions">
    <YunDropdownMenu :items="menuItems" @select="onSelect">
      <template #trigger>
        <button class="yun-post-actions-btn" :aria-label="t('menu.title', 'Menu')">
          <div i-ri-more-line />
        </button>
      </template>
    </YunDropdownMenu>
  </div>
</template>

<style>
.yun-post-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
}

.yun-post-actions-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: var(--va-c-bg-opacity);
  color: var(--va-c-text-3);
  padding: 0.15rem;
  border-radius: 0.25rem;
  transition: color 0.2s, background 0.2s;
  font-size: 1rem;
}

.yun-post-actions-btn:hover {
  color: var(--va-c-primary);
  background: var(--va-c-bg-soft);
}
</style>
