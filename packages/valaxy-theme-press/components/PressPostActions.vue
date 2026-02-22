<script lang="ts" setup>
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui'
import { useCopyMarkdown, useFrontmatter, useFullUrl, useValaxyI18n } from 'valaxy'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEditLink } from '../composables'

const { copy, copied, loading, available, mdUrl } = useCopyMarkdown()
const { t } = useI18n()
const editLink = useEditLink()
const frontmatter = useFrontmatter()
const { $tO } = useValaxyI18n()
const fullUrl = useFullUrl()

const linkCopied = ref(false)

interface MenuItem {
  key: string
  label: string
  icon?: string
  disabled?: boolean
  external?: boolean
}

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
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
      external: true,
    },
    { key: 'separator', label: '' },
    {
      key: 'open-chatgpt',
      label: t('post.open_in_chatgpt', 'Open in ChatGPT'),
      icon: 'i-simple-icons-openai',
      external: true,
    },
    {
      key: 'open-claude',
      label: t('post.open_in_claude', 'Open in Claude'),
      icon: 'i-simple-icons-claude',
      external: true,
    },
  ]

  if (editLink.value.url) {
    items.push(
      { key: 'separator-2', label: '' },
      {
        key: 'edit-link',
        label: editLink.value.text || t('post.open_in_github', 'Open in GitHub'),
        icon: 'i-ri-github-line',
        external: true,
      },
    )
  }

  return items
})

async function copyMarkdownLink() {
  try {
    const title = $tO(frontmatter.value.title) || 'Untitled'
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

function buildAIUrl(provider: 'chatgpt' | 'claude') {
  const rawMdUrl = new URL(mdUrl.value, fullUrl.value).href
  const prompt = `Read ${rawMdUrl} so I can ask questions about it.`
  if (provider === 'chatgpt')
    return `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
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
    case 'open-chatgpt':
      window.open(buildAIUrl('chatgpt'), '_blank')
      break
    case 'open-claude':
      window.open(buildAIUrl('claude'), '_blank')
      break
    case 'edit-link':
      if (editLink.value.url)
        window.open(editLink.value.url, '_blank')
      break
  }
}
</script>

<template>
  <div v-if="available" class="press-post-actions">
    <button
      class="press-post-actions-main"
      :disabled="loading"
      :aria-label="t('post.copy_markdown', 'Copy Markdown')"
      @click="copy"
    >
      <div v-if="copied" i-ri-check-line class="text-green-500" />
      <div v-else i-ri-file-copy-line />
      <span>{{ copied ? t('post.copied_markdown', 'Copied!') : t('post.copy_page', 'Copy page') }}</span>
    </button>
    <DropdownMenuRoot>
      <DropdownMenuTrigger as-child>
        <button class="press-post-actions-trigger" :aria-label="t('menu.title', 'More actions')">
          <div i-ri-arrow-down-s-line />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent class="press-dropdown-menu-content" :side-offset="4" align="end">
          <template v-for="(item, index) in menuItems" :key="`${item.key}-${index}`">
            <DropdownMenuSeparator v-if="item.key.startsWith('separator')" class="press-dropdown-menu-separator" />
            <DropdownMenuItem v-else class="press-dropdown-menu-item" :disabled="item.disabled" @select="onSelect(item.key)">
              <div v-if="item.icon" :class="item.icon" />
              <span flex-1>{{ item.label }}</span>
              <div v-if="item.external" i-ri-external-link-line class="press-dropdown-menu-external" />
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>

<style>
.press-post-actions {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--va-c-divider);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.press-post-actions-main {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  border: none;
  background: var(--va-c-bg-alt);
  color: var(--va-c-text-2);
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
}

.press-post-actions-main:hover {
  color: var(--va-c-primary);
  background: var(--va-c-bg-soft);
}

.press-post-actions-main:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.press-post-actions-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  border-left: 1px solid var(--va-c-divider);
  background: var(--va-c-bg-alt);
  color: var(--va-c-text-3);
  padding: 4px 6px;
  font-size: 14px;
  transition: color 0.2s, background 0.2s;
}

.press-post-actions-trigger:hover {
  color: var(--va-c-primary);
  background: var(--va-c-bg-soft);
}

.press-dropdown-menu-content {
  min-width: 200px;
  background: var(--va-c-bg);
  border: 1px solid var(--va-c-divider);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  z-index: 100;
  animation: press-dropdown-fade-in 0.15s ease;
}

@keyframes press-dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.press-dropdown-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--va-c-text-2);
  transition: background 0.15s, color 0.15s;
  outline: none;
}

.press-dropdown-menu-item:hover,
.press-dropdown-menu-item[data-highlighted] {
  background: var(--va-c-bg-soft);
  color: var(--va-c-text);
}

.press-dropdown-menu-item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.press-dropdown-menu-separator {
  height: 1px;
  background: var(--va-c-divider);
  margin: 4px 8px;
}

.press-dropdown-menu-external {
  font-size: 11px;
  color: var(--va-c-text-3);
  opacity: 0.6;
}
</style>
