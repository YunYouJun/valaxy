<script lang="ts" setup>
import type { LocalizedValaxyAddon } from '../data/addons'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

defineProps<{
  addon: LocalizedValaxyAddon
}>()

const emit = defineEmits<{
  tagClick: [tag: string]
}>()

const { t } = useI18n()

function handleTagClick(tag: string) {
  emit('tagClick', tag)
}

function handlePointerMove(event: PointerEvent) {
  const element = event.currentTarget as HTMLElement
  const bounds = element.getBoundingClientRect()

  element.style.setProperty('--addon-pointer-x', `${event.clientX - bounds.left}px`)
  element.style.setProperty('--addon-pointer-y', `${event.clientY - bounds.top}px`)
}
</script>

<template>
  <div
    class="addon-gallery-card"
    :class="{ 'is-official': addon.kind === 'official' }"
    @pointermove="handlePointerMove"
  >
    <h3 class="addon-gallery-card-heading my-0!">
      <span class="addon-gallery-card-icon" :class="addon.icon" />
      <RouterLink v-if="addon.docs" class="addon-gallery-card-title decoration-none!" :to="addon.docs">
        {{ addon.name }}
      </RouterLink>
      <a v-else class="addon-gallery-card-title decoration-none!" :href="addon.repo" target="_blank" rel="noopener">
        {{ addon.name }}
      </a>
      <span v-if="addon.kind === 'official'" class="addon-gallery-card-badge">
        <span class="i-ri-verified-badge-line" aria-hidden="true" />
        {{ t('gallery.officialBadge') }}
      </span>
    </h3>

    <div class="addon-gallery-card-meta">
      <RouterLink
        v-if="addon.docs"
        class="addon-gallery-card-link addon-gallery-card-docs"
        :to="addon.docs"
        :aria-label="`${addon.name}: ${t('gallery.docs')}`"
        :title="t('gallery.docs')"
      >
        <span i-ri-book-open-line />
      </RouterLink>
      <a class="addon-gallery-card-link text-red-600!" :href="`https://npmjs.com/package/${addon.name}`" target="_blank" rel="noopener" :aria-label="`${addon.name}: ${t('gallery.npm')}`" :title="t('gallery.npm')">
        <span i-ri-npmjs-line />
      </a>
      <a class="addon-gallery-card-link text-slate-600! dark:text-slate-200!" :href="addon.repo" target="_blank" rel="noopener" :aria-label="`${addon.name}: ${t('gallery.repo')}`" :title="t('gallery.repo')">
        <span i-ri-github-line />
      </a>
      <span class="addon-gallery-card-by">By</span>
      <span v-for="(author, index) in addon.author" :key="author" class="addon-gallery-card-author">
        <a
          class="addon-gallery-card-author-link"
          :href="`https://github.com/${author}`"
          target="_blank"
          rel="noopener"
        >{{ author }}</a>
        <span v-if="index < addon.author.length - 1">, </span>
      </span>
    </div>

    <p class="addon-gallery-card-desc" :title="addon.description">
      {{ addon.description }}
    </p>
    <div class="addon-gallery-card-tags" role="group" :aria-label="t('gallery.tags')">
      <button
        v-for="tag in addon.tags" :key="tag"
        type="button"
        class="addon-gallery-card-tag"
        @click="handleTagClick(tag)"
      >
        #{{ tag }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.addon-gallery-card {
  --addon-pointer-x: 50%;
  --addon-pointer-y: 50%;

  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
  overflow: hidden;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.875rem;
  padding: 1.125rem;
  background:
    linear-gradient(145deg, rgb(var(--va-c-primary-rgb), 0.035), transparent 42%),
    var(--va-c-bg);
  box-shadow: 0 8px 26px rgb(15 23 42 / 0.055);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;

  &::before {
    position: absolute;
    z-index: 0;
    inset: 0;
    background: radial-gradient(240px circle at var(--addon-pointer-x) var(--addon-pointer-y), rgb(var(--va-c-primary-rgb), 0.14), transparent 68%);
    content: '';
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  &::after {
    position: absolute;
    z-index: 0;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, transparent 8%, rgb(var(--va-c-primary-rgb), 0.5), transparent 92%) top center / 62% 1px no-repeat;
    content: '';
    opacity: 0.38;
    pointer-events: none;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  &.is-official {
    border-color: rgb(var(--va-c-primary-rgb), 0.24);
  }

  &:hover,
  &:focus-within {
    border-color: rgb(var(--va-c-primary-rgb), 0.46);
    box-shadow: 0 16px 38px rgb(15 23 42 / 0.1), 0 0 0 1px rgb(var(--va-c-primary-rgb), 0.06);
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
  }
}

.addon-gallery-card-title {
  color: var(--va-c-text);
  overflow-wrap: anywhere;

  &:hover {
    color: var(--va-c-primary);
  }
}

.addon-gallery-card-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.addon-gallery-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgb(var(--va-c-primary-rgb), 0.16);
  border-radius: 0.625rem;
  background: var(--va-c-brand-soft);
  color: var(--va-c-primary);
  font-size: 1.125rem;
  box-shadow: inset 0 1px rgb(255 255 255 / 0.12);
}

.addon-gallery-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border: 1px solid var(--va-c-primary);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  background: var(--va-c-brand-soft);
  color: var(--va-c-primary);
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.35;
}

.addon-gallery-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  color: var(--va-c-text-3);
  font-size: 0.875rem;
}

.addon-gallery-card-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  background: var(--va-c-default-soft);
  font-size: 1.0625rem;
  transition: border-color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgb(var(--va-c-primary-rgb), 0.18);
    background: var(--va-c-brand-soft);
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.addon-gallery-card-docs {
  color: var(--va-c-primary);
}

.addon-gallery-card-by {
  margin-left: 0.25rem;
}

.addon-gallery-card-author-link {
  color: var(--va-c-text-2);

  &:hover {
    color: var(--va-c-primary);
  }
}

.addon-gallery-card-desc {
  margin: 0;
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
}

.addon-gallery-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: auto !important;
}

.addon-gallery-card-tag {
  display: inline-flex;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  background: rgb(var(--va-c-primary-rgb), 0.045);
  color: var(--va-c-text-2);
  font-size: 0.8125rem;
  line-height: 1.5;
  word-break: break-all;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--va-c-primary);
    color: var(--va-c-primary);
    background: var(--va-c-brand-soft);
  }
}

:global(.dark .addon-gallery-card) {
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.2);

  &:hover,
  &:focus-within {
    box-shadow: 0 18px 42px rgb(0 0 0 / 0.32), 0 0 0 1px rgb(var(--va-c-primary-rgb), 0.08);
  }
}

.addon-gallery-card-title:focus-visible,
.addon-gallery-card-link:focus-visible,
.addon-gallery-card-author-link:focus-visible,
.addon-gallery-card-tag:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 3px;
}

@media (width <= 640px) {
  .addon-gallery-card {
    gap: 0.625rem;
    padding: 0.95rem;
  }

  .addon-gallery-card-title {
    font-size: 0.975rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .addon-gallery-card,
  .addon-gallery-card::before,
  .addon-gallery-card-link {
    transition: none;
  }

  .addon-gallery-card:hover,
  .addon-gallery-card:focus-within,
  .addon-gallery-card-link:hover {
    transform: none;
  }

  .addon-gallery-card::before {
    display: none;
  }
}
</style>
