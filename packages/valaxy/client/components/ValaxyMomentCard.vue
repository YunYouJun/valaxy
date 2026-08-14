<script setup lang="ts">
import type { MomentEntry, MomentsAuthor } from '../../types/moments'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMomentLike } from '../composables/moments'

const props = defineProps<{
  author: MomentsAuthor
  moment: MomentEntry
}>()

const { t } = useI18n()
const { count: likeCount, hydrated, liked, toggle } = useMomentLike(props.moment.path)
const contentElement = ref<HTMLElement>()
const cardElement = ref<HTMLElement>()
const zoomSourceImages = new Set<HTMLImageElement>()
const contentId = `valaxy-moment-content-${useId()}`
const expanded = ref(false)
const hasOverflowingContent = ref(false)
let resizeObserver: ResizeObserver | undefined

function checkContentOverflow() {
  const element = contentElement.value
  if (!element || typeof window === 'undefined')
    return

  const rootFontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16
  hasOverflowingContent.value = element.scrollHeight > rootFontSize * 12 + 1
  if (!hasOverflowingContent.value)
    expanded.value = false
}

function prepareZoomSource(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.classList.add('is-zoom-source')
  zoomSourceImages.add(image)
}

function restoreZoomSource(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.classList.remove('is-zoom-source')
  zoomSourceImages.delete(image)
}

function setupZoomSources() {
  for (const image of cardElement.value?.querySelectorAll<HTMLImageElement>('.valaxy-moment-image') ?? []) {
    image.addEventListener('medium-zoom:open', prepareZoomSource)
    image.addEventListener('medium-zoom:opened', restoreZoomSource)
    image.addEventListener('medium-zoom:close', restoreZoomSource)
  }
}

onMounted(() => {
  checkContentOverflow()
  setupZoomSources()
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(checkContentOverflow)
    if (contentElement.value?.firstElementChild)
      resizeObserver.observe(contentElement.value.firstElementChild)
  }
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  for (const image of cardElement.value?.querySelectorAll<HTMLImageElement>('.valaxy-moment-image') ?? []) {
    image.removeEventListener('medium-zoom:open', prepareZoomSource)
    image.removeEventListener('medium-zoom:opened', restoreZoomSource)
    image.removeEventListener('medium-zoom:close', restoreZoomSource)
  }
  for (const image of zoomSourceImages)
    image.classList.remove('is-zoom-source')
})
watch(() => props.moment.content, async () => {
  expanded.value = false
  await nextTick()
  checkContentOverflow()
})

const authorInitial = computed(() => props.author.name?.trim().charAt(0).toUpperCase() || '?')
const formattedDate = computed(() => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(props.moment.date)))
const imageGridClass = computed(() => `valaxy-moment-images-${props.moment.images.length}`)
</script>

<template>
  <article ref="cardElement" class="valaxy-moment-card">
    <header class="valaxy-moment-header">
      <img
        v-if="author.avatar"
        :src="author.avatar"
        :alt="`${author.name || t('moments.author', 'Author')} avatar`"
        class="valaxy-moment-avatar"
        decoding="async"
        height="48"
        loading="lazy"
        width="48"
      >
      <span v-else class="valaxy-moment-avatar valaxy-moment-avatar-fallback" aria-hidden="true">
        {{ authorInitial }}
      </span>

      <div class="valaxy-moment-identity">
        <strong>{{ author.name || t('moments.author', 'Author') }}</strong>
        <time :datetime="new Date(moment.date).toISOString()">{{ formattedDate }}</time>
      </div>

      <span v-if="moment.top && moment.top > 0" class="valaxy-moment-pinned" :title="t('moments.pinned', 'Pinned')">
        <span class="valaxy-moment-pinned-icon i-ri-pushpin-line" aria-hidden="true" />
        <span class="sr-only">{{ t('moments.pinned', 'Pinned') }}</span>
      </span>
    </header>

    <h2 v-if="moment.title" class="valaxy-moment-title">
      {{ moment.title }}
    </h2>

    <div
      :id="contentId"
      ref="contentElement"
      class="valaxy-moment-content"
      :class="{ 'is-collapsed': hasOverflowingContent && !expanded }"
    >
      <!-- Local Markdown files are trusted author content. -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="markdown-body" v-html="moment.content" />
    </div>
    <button
      v-if="hasOverflowingContent"
      class="valaxy-moment-toggle"
      type="button"
      :aria-controls="contentId"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span>{{ t(expanded ? 'moments.collapse' : 'moments.expand') }}</span>
      <span
        class="valaxy-moment-toggle-icon"
        :class="expanded ? 'i-ri-arrow-up-s-line' : 'i-ri-arrow-down-s-line'"
        aria-hidden="true"
      />
    </button>

    <div
      v-if="moment.images.length"
      class="valaxy-moment-images markdown-body"
      :class="imageGridClass"
      :aria-label="t('moments.images', { count: moment.images.length })"
    >
      <img
        v-for="(image, index) in moment.images"
        :key="`${image.src}-${index}`"
        :src="image.src"
        class="valaxy-moment-image"
        :alt="image.alt || t('moments.image', { index: index + 1 })"
        :height="image.height"
        :width="image.width"
        decoding="async"
        loading="lazy"
      >
    </div>

    <footer class="valaxy-moment-footer">
      <span v-if="moment.location" class="valaxy-moment-location">
        <span class="i-ri-map-pin-2-line" aria-hidden="true" />
        <span>{{ moment.location }}</span>
      </span>
      <button
        class="valaxy-moment-like"
        :class="{ liked }"
        type="button"
        :aria-label="t(liked ? 'moments.unlike' : 'moments.like')"
        :aria-pressed="liked"
        :disabled="!hydrated"
        @click="toggle"
      >
        <span :class="liked ? 'i-ri-heart-3-fill' : 'i-ri-heart-3-line'" aria-hidden="true" />
        <span>{{ likeCount }}</span>
      </button>
    </footer>
  </article>
</template>

<style scoped>
.valaxy-moment-card {
  padding: clamp(1rem, 3vw, 1.5rem);
  overflow: hidden;
  scroll-margin-top: 6rem;
  color: var(--va-c-text-1, #202124);
  background: var(--va-c-bg-light, #fff);
  border: 1px solid var(--va-c-divider, rgb(128 128 128 / 0.18));
  border-radius: 1rem;
  transition: box-shadow 200ms ease;
}

.valaxy-moment-card:hover {
  box-shadow: 0 4px 24px rgb(0 0 0 / 0.08);
}

.valaxy-moment-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.valaxy-moment-avatar {
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 0.8rem;
}

.valaxy-moment-avatar-fallback {
  display: grid;
  color: white;
  font-weight: 700;
  background: var(--va-c-primary, #4f8cff);
  place-items: center;
}

.valaxy-moment-identity {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.valaxy-moment-identity strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valaxy-moment-identity time,
.valaxy-moment-location {
  color: var(--va-c-text-2, #74777d);
  font-size: 0.84rem;
}

.valaxy-moment-pinned {
  color: var(--va-c-warning, var(--va-c-primary, #e6a23c));
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.valaxy-moment-pinned-icon {
  display: block;
  flex: 0 0 auto;
  font-size: 1.15rem;
}

.valaxy-moment-title {
  margin: 1rem 0 0;
  font-size: 1.12rem;
  line-height: 1.5;
}

.valaxy-moment-content {
  --valaxy-moment-collapsed-height: 12rem;

  position: relative;
  margin-top: 0.8rem;
}

.valaxy-moment-content.is-collapsed {
  max-height: var(--valaxy-moment-collapsed-height);
  overflow: hidden;
  mask-image: linear-gradient(to bottom, #000 calc(100% - 2.5rem), transparent);
}

.valaxy-moment-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-height: 2rem;
  padding: 0.2rem 0.65rem;
  margin: 0.15rem auto 0;
  color: var(--va-c-primary, var(--va-c-brand-1, #4f8cff));
  font: inherit;
  font-size: 0.86rem;
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.valaxy-moment-toggle:hover {
  background: var(--va-c-bg-soft, rgb(128 128 128 / 0.08));
}

.valaxy-moment-toggle:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 2px;
}

.valaxy-moment-toggle-icon {
  display: block;
  flex: 0 0 auto;
  font-size: 1.15em;
}

.valaxy-moment-content :deep(.markdown-body > :first-child) {
  margin-top: 0;
}

.valaxy-moment-content :deep(.markdown-body > :last-child) {
  margin-bottom: 0;
}

.valaxy-moment-images {
  display: grid;
  gap: 0.35rem;
  margin-top: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.valaxy-moment-images-1 {
  grid-template-columns: minmax(0, min(100%, 30rem));
}

.valaxy-moment-images-2,
.valaxy-moment-images-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.valaxy-moment-images img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  cursor: zoom-in;
  border-radius: 0.5rem;
}

.valaxy-moment-images-1 img {
  max-height: 30rem;
  aspect-ratio: auto;
  object-fit: contain;
  object-position: left center;
}

.valaxy-moment-image.is-zoom-source {
  height: auto;
  aspect-ratio: auto;
  object-fit: contain;
}

:global([class~='medium-zoom-overlay']) {
  z-index: 9998;
}

:global([class~='medium-zoom-image--opened']) {
  z-index: 9999;
}

.valaxy-moment-footer {
  display: flex;
  align-items: center;
  margin-top: 0.9rem;
}

.valaxy-moment-location,
.valaxy-moment-like {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
}

.valaxy-moment-like {
  padding: 0.3rem 0.55rem;
  margin-left: auto;
  color: var(--va-c-text-2, #74777d);
  font: inherit;
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.valaxy-moment-like.liked {
  color: #ef476f;
}

.valaxy-moment-like:disabled {
  cursor: default;
  opacity: 0.65;
}

.valaxy-moment-like:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
}

@media (width <= 28rem) {
  .valaxy-moment-images {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
