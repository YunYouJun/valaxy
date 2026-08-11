<script lang="ts" setup>
import type { LocalizedValaxyTheme } from '../data/themes'
import { shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

defineProps<{
  theme: LocalizedValaxyTheme
}>()

const emit = defineEmits<{
  tagClick: [tag: string]
}>()

const { t } = useI18n()
const imageFailed = shallowRef(false)

function handleTagClick(tag: string) {
  emit('tagClick', tag)
}

function handlePointerMove(event: PointerEvent) {
  const element = event.currentTarget as HTMLElement
  const bounds = element.getBoundingClientRect()

  element.style.setProperty('--theme-pointer-x', `${event.clientX - bounds.left}px`)
  element.style.setProperty('--theme-pointer-y', `${event.clientY - bounds.top}px`)
}
</script>

<template>
  <article
    class="theme-gallery-card"
    :class="{ 'is-official': theme.kind === 'official' }"
    @pointermove="handlePointerMove"
  >
    <a
      class="theme-gallery-card-preview"
      :href="theme.siteExampleUrl || theme.repo"
      target="_blank"
      rel="noopener"
      :aria-label="`${theme.name}: ${t('themeGallery.preview')}`"
    >
      <img
        v-if="!imageFailed"
        class="theme-gallery-card-image"
        :src="theme.siteImage"
        :alt="`${theme.name} ${t('themeGallery.screenshot')}`"
        width="1600"
        height="900"
        loading="lazy"
        decoding="async"
        @error="imageFailed = true"
      >
      <span v-else class="theme-gallery-card-fallback" role="img" :aria-label="t('themeGallery.imageUnavailable')">
        <span class="theme-gallery-card-fallback-icon" :class="theme.icon" aria-hidden="true" />
        <span>{{ theme.name }}</span>
      </span>
      <span class="theme-gallery-card-preview-shade" aria-hidden="true" />
      <span class="theme-gallery-card-preview-action">
        <span class="i-ri-external-link-line" aria-hidden="true" />
        {{ t('themeGallery.preview') }}
      </span>
    </a>

    <div class="theme-gallery-card-body">
      <div class="theme-gallery-card-heading">
        <span class="theme-gallery-card-icon" :class="theme.icon" aria-hidden="true" />
        <h3 class="theme-gallery-card-title my-0!">
          <RouterLink v-if="theme.docs" class="decoration-none!" :to="theme.docs">
            {{ theme.name }}
          </RouterLink>
          <a v-else class="decoration-none!" :href="theme.repo" target="_blank" rel="noopener">
            {{ theme.name }}
          </a>
        </h3>
        <span v-if="theme.kind === 'official'" class="theme-gallery-card-badge">
          <span class="i-ri-verified-badge-line" aria-hidden="true" />
          {{ t('themeGallery.officialBadge') }}
        </span>
      </div>

      <p class="theme-gallery-card-desc" :title="theme.description">
        {{ theme.description }}
      </p>

      <div class="theme-gallery-card-footer">
        <div class="theme-gallery-card-tags" role="group" :aria-label="t('themeGallery.tags')">
          <button
            v-for="tag in theme.tags"
            :key="tag"
            type="button"
            class="theme-gallery-card-tag"
            @click="handleTagClick(tag)"
          >
            #{{ tag }}
          </button>
        </div>

        <div class="theme-gallery-card-links">
          <RouterLink
            v-if="theme.docs"
            class="theme-gallery-card-link theme-gallery-card-docs"
            :to="theme.docs"
            :aria-label="`${theme.name}: ${t('themeGallery.docs')}`"
            :title="t('themeGallery.docs')"
          >
            <span class="i-ri-book-open-line" aria-hidden="true" />
          </RouterLink>
          <a
            class="theme-gallery-card-link theme-gallery-card-npm"
            :href="`https://npmjs.com/package/${theme.name}`"
            target="_blank"
            rel="noopener"
            :aria-label="`${theme.name}: ${t('themeGallery.npm')}`"
            :title="t('themeGallery.npm')"
          >
            <span class="i-ri-npmjs-line" aria-hidden="true" />
          </a>
          <a
            v-if="theme.siteExampleUrl"
            class="theme-gallery-card-link theme-gallery-card-demo"
            :href="theme.siteExampleUrl"
            target="_blank"
            rel="noopener"
            :aria-label="`${theme.name}: ${t('themeGallery.demo')}`"
            :title="t('themeGallery.demo')"
          >
            <span class="i-ri-slideshow-2-line" aria-hidden="true" />
          </a>
          <a
            class="theme-gallery-card-link theme-gallery-card-repo"
            :href="theme.repo"
            target="_blank"
            rel="noopener"
            :aria-label="`${theme.name}: ${t('themeGallery.repo')}`"
            :title="t('themeGallery.repo')"
          >
            <span class="i-ri-github-line" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.theme-gallery-card {
  --theme-pointer-x: 50%;
  --theme-pointer-y: 50%;

  position: relative;
  isolation: isolate;
  min-height: 100%;
  overflow: hidden;
  border: 1px solid var(--va-c-divider);
  border-radius: 1rem;
  background: var(--va-c-bg);
  box-shadow: 0 10px 30px rgb(15 23 42 / 0.065);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;

  &::before {
    position: absolute;
    z-index: 2;
    inset: 0;
    background: radial-gradient(280px circle at var(--theme-pointer-x) var(--theme-pointer-y), rgb(var(--va-c-primary-rgb), 0.12), transparent 68%);
    content: '';
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  &.is-official {
    border-color: rgb(var(--va-c-primary-rgb), 0.24);
  }

  &:hover,
  &:focus-within {
    border-color: rgb(var(--va-c-primary-rgb), 0.46);
    box-shadow: 0 18px 44px rgb(15 23 42 / 0.12), 0 0 0 1px rgb(var(--va-c-primary-rgb), 0.06);
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
  }
}

.theme-gallery-card-preview {
  position: relative;
  z-index: 1;
  display: block;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border-bottom: 1px solid var(--va-c-divider);
  background:
    radial-gradient(circle at 50% 0, rgb(var(--va-c-primary-rgb), 0.16), transparent 56%),
    radial-gradient(rgb(var(--va-c-primary-rgb), 0.14) 1px, transparent 1px),
    var(--va-c-default-soft);
  background-size: auto, 18px 18px, auto;

  &:hover,
  &:focus-visible {
    .theme-gallery-card-image {
      transform: scale(1.025);
    }

    .theme-gallery-card-preview-shade {
      opacity: 1;
    }

    .theme-gallery-card-preview-action {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  &:focus-visible {
    outline: 3px solid var(--va-c-primary);
    outline-offset: -3px;
  }
}

.theme-gallery-card-image {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.2, 0.75, 0.25, 1);
}

.theme-gallery-card-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  text-align: center;
}

.theme-gallery-card-fallback-icon {
  color: var(--va-c-primary);
  font-size: 2.25rem;
}

.theme-gallery-card-preview-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(2 6 23 / 0.04), rgb(2 6 23 / 0.56));
  opacity: 0;
  transition: opacity 0.25s ease;
}

.theme-gallery-card-preview-action {
  position: absolute;
  top: 50%;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgb(255 255 255 / 0.32);
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  background: rgb(2 6 23 / 0.56);
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
  opacity: 0;
  backdrop-filter: blur(8px);
  transform: translate(-50%, calc(-50% + 8px));
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.theme-gallery-card-body {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 11.5rem;
  padding: 1rem 1.125rem 1.125rem;
  background:
    linear-gradient(145deg, rgb(var(--va-c-primary-rgb), 0.04), transparent 46%),
    var(--va-c-bg);
}

.theme-gallery-card-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.theme-gallery-card-icon {
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

.theme-gallery-card-title {
  min-width: 0;
  flex: 1;
  font-size: 1rem;
  line-height: 1.45;

  a {
    color: var(--va-c-text);
    overflow-wrap: anywhere;

    &:hover {
      color: var(--va-c-primary);
    }

    &:focus-visible {
      outline: 2px solid var(--va-c-primary);
      outline-offset: 3px;
    }
  }
}

.theme-gallery-card-badge {
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

.theme-gallery-card-desc {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.theme-gallery-card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
}

.theme-gallery-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.theme-gallery-card-tag {
  display: inline-flex;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  background: rgb(var(--va-c-primary-rgb), 0.045);
  color: var(--va-c-text-2);
  font-size: 0.75rem;
  line-height: 1.5;
  word-break: break-all;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--va-c-primary);
    background: var(--va-c-brand-soft);
    color: var(--va-c-primary);
  }
}

.theme-gallery-card-links {
  display: flex;
  flex: none;
  gap: 0.4rem;
}

.theme-gallery-card-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  background: var(--va-c-default-soft);
  color: var(--va-c-text-2);
  font-size: 1.0625rem;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgb(var(--va-c-primary-rgb), 0.24);
    background: var(--va-c-brand-soft);
    color: var(--va-c-primary);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--va-c-primary);
    outline-offset: 3px;
  }
}

.theme-gallery-card-docs {
  color: var(--va-c-primary);
}

.theme-gallery-card-npm {
  color: #dc2626;
}

.theme-gallery-card-demo {
  color: #2563eb;
}

:global(.dark .theme-gallery-card) {
  box-shadow: 0 12px 34px rgb(0 0 0 / 0.22);

  &:hover,
  &:focus-within {
    box-shadow: 0 20px 46px rgb(0 0 0 / 0.34), 0 0 0 1px rgb(var(--va-c-primary-rgb), 0.08);
  }
}

@media (hover: none) {
  .theme-gallery-card-preview-shade {
    background: linear-gradient(180deg, transparent 52%, rgb(2 6 23 / 0.42));
    opacity: 1;
  }

  .theme-gallery-card-preview-action {
    inset: auto 0.625rem 0.625rem auto;
    padding: 0.35rem 0.625rem;
    opacity: 1;
    transform: none;
  }
}

@media (width <= 640px) {
  .theme-gallery-card {
    border-radius: 0.875rem;
  }

  .theme-gallery-card-body {
    gap: 0.625rem;
    min-height: 0;
    padding: 0.875rem;
  }

  .theme-gallery-card-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.625rem;
  }

  .theme-gallery-card-links {
    align-self: flex-end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-gallery-card,
  .theme-gallery-card::before,
  .theme-gallery-card-image,
  .theme-gallery-card-preview-shade,
  .theme-gallery-card-preview-action,
  .theme-gallery-card-link {
    transition: none;
  }

  .theme-gallery-card:hover,
  .theme-gallery-card:focus-within,
  .theme-gallery-card-link:hover,
  .theme-gallery-card-preview:hover .theme-gallery-card-image {
    transform: none;
  }

  .theme-gallery-card::before {
    display: none;
  }
}
</style>
