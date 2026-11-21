<script lang="ts" setup>
import type { Post } from 'valaxy'
import { TooltipProvider } from 'reka-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  frontmatter: Post
}>()

const { t } = useI18n()

const statusItems = computed(() => {
  const items: Array<{ key: string, className: string, icon: string, label: string }> = []
  if (props.frontmatter.top) {
    items.push({
      key: 'top',
      className: 'is-top',
      icon: 'i-ri-pushpin-line',
      label: t('theme.postStatusTop'),
    })
  }
  if (props.frontmatter.hide) {
    items.push({
      key: 'hide',
      className: 'is-hide',
      icon: props.frontmatter.hide === 'index' ? 'i-ri-eye-close-line' : 'i-ri-eye-off-line',
      label: props.frontmatter.hide === 'index' ? t('theme.postStatusHideIndex') : t('theme.postStatusHide'),
    })
  }
  if (props.frontmatter.draft) {
    items.push({
      key: 'draft',
      className: 'is-draft',
      icon: 'i-ri-draft-line',
      label: t('theme.postStatusDraft'),
    })
  }
  return items
})
</script>

<template>
  <TooltipProvider v-if="statusItems.length" :delay-duration="200" :skip-delay-duration="300">
    <div class="post-status-icons">
      <YunTooltip
        v-for="item in statusItems"
        :key="item.key"
        :content="item.label"
        side="top"
      >
        <span
          class="post-status-bookmark"
          :class="item.className"
          tabindex="0"
          role="img"
          :aria-label="item.label"
        >
          <span :class="item.icon" aria-hidden="true" />
        </span>
      </YunTooltip>
    </div>
  </TooltipProvider>
</template>

<style lang="scss">
.post-status-icons {
  position: absolute;
  top: 0;
  left: 1rem;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  pointer-events: none;
}

.post-status-bookmark {
  pointer-events: auto;
  width: 1.625rem;
  height: 2.125rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0.3125rem;
  font-size: 0.9rem;
  cursor: default;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 6px), 0 100%);
  transition: filter 160ms ease, background-color 160ms ease;

  &:focus-visible {
    outline: none;
    filter: drop-shadow(0 0 2px var(--yun-focus-color));
  }

  &.is-draft {
    background-color: rgb(217 119 6 / 0.13);
    color: #b45309;
  }

  &.is-top {
    background-color: color-mix(in srgb, var(--va-c-link) 13%, transparent);
    color: var(--va-c-link);
  }

  &.is-hide {
    background-color: rgb(225 29 72 / 0.11);
    color: #be123c;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

html.dark .post-status-bookmark {
  &.is-draft {
    background-color: rgb(245 158 11 / 0.22);
    color: #fbbf24;
  }

  &.is-top {
    background-color: color-mix(in srgb, var(--va-c-link) 22%, transparent);
    color: var(--va-c-link);
  }

  &.is-hide {
    background-color: rgb(251 113 133 / 0.2);
    color: #fda4af;
  }
}
</style>
