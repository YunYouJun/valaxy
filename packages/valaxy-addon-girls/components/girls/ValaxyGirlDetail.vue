<script setup lang="ts">
import type { GirlEntry, GirlReasonMode } from '../../types'
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  girl: GirlEntry
  portrait?: boolean
  reasonMode?: GirlReasonMode
}>(), {
  portrait: false,
  reasonMode: 'hidden',
})

const { t } = useI18n()
const imageFailed = shallowRef(!props.girl.avatar)
const characterUrl = computed(() => (
  props.girl.url || `https://zh.moegirl.org.cn/${encodeURIComponent(props.girl.name)}`
))
const detailClasses = computed(() => ({
  'valaxy-girl-detail': true,
  [`valaxy-girl-detail-reason-${props.reasonMode}`]: true,
  'valaxy-girl-detail-with-portrait': props.portrait,
}))
const showReason = computed(() => Boolean(props.girl.reason) && props.reasonMode !== 'hidden')

watch(() => props.girl.avatar, avatar => imageFailed.value = !avatar)

function handleImageError() {
  imageFailed.value = true
}
</script>

<template>
  <article :class="detailClasses" aria-live="polite" aria-atomic="true">
    <span v-if="portrait" class="valaxy-girl-detail-portrait" aria-hidden="true">
      <img
        v-if="!imageFailed"
        class="valaxy-girl-detail-avatar"
        :src="girl.avatar"
        alt=""
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      >
      <span v-else class="valaxy-girl-detail-fallback">{{ girl.name.slice(0, 1) }}</span>
    </span>

    <div class="valaxy-girl-detail-copy">
      <strong class="valaxy-girl-detail-name">{{ girl.name }}</strong>
      <span v-if="girl.from" class="valaxy-girl-detail-from">{{ girl.from }}</span>
      <p v-if="showReason" class="valaxy-girl-detail-reason">
        {{ girl.reason }}
      </p>
    </div>

    <a
      class="valaxy-girl-detail-link"
      :href="characterUrl"
      :aria-label="t(
        'addon.girls.profile',
        { name: girl.name },
        `View ${girl.name}'s profile`,
      )"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="i-ri-arrow-right-up-line" aria-hidden="true" />
    </a>
  </article>
</template>

<style scoped>
.valaxy-girl-detail {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 2.15rem 0.7rem 0.8rem;
  color: var(--valaxy-girls-ink);
  background: color-mix(in srgb, var(--valaxy-girls-paper) 94%, transparent);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 0.7rem;
  box-shadow: 0 0.5rem 1.4rem rgb(31 46 64 / 0.14);
  text-align: left;
  backdrop-filter: blur(0.8rem);
}

.valaxy-girl-detail-portrait {
  display: block;
  overflow: hidden;
  width: 3.25rem;
  height: 3.25rem;
  flex: none;
  border: 2px solid color-mix(in srgb, var(--valaxy-girls-sky) 55%, var(--valaxy-girls-paper));
  border-radius: 50%;
}

.valaxy-girl-detail-avatar,
.valaxy-girl-detail-fallback {
  display: block;
  width: 100%;
  height: 100%;
}

.valaxy-girl-detail-avatar {
  max-width: none;
  margin: 0;
  object-fit: cover;
  object-position: center top;
}

.valaxy-girl-detail-fallback {
  display: grid;
  place-items: center;
  color: var(--valaxy-girls-sky-deep);
  background: var(--valaxy-girls-soft);
  font-family: var(--va-font-serif);
  font-size: 1.4rem;
  font-weight: 800;
}

.valaxy-girl-detail-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.valaxy-girl-detail-name,
.valaxy-girl-detail-from {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valaxy-girl-detail-name {
  font-family: var(--va-font-serif);
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.valaxy-girl-detail-from {
  margin-top: 0.15rem;
  color: var(--valaxy-girls-muted);
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  line-height: 1.4;
  text-transform: uppercase;
}

.valaxy-girl-detail-reason {
  display: -webkit-box;
  overflow: hidden;
  margin: 0.42rem 0 0;
  padding-top: 0.35rem;
  color: var(--valaxy-girls-muted);
  border-top: 1px dashed var(--valaxy-girls-line);
  font-size: 0.62rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.valaxy-girl-detail-reason-hover .valaxy-girl-detail-reason {
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
  opacity: 0;
  transition:
    max-height 180ms ease,
    margin 180ms ease,
    opacity 180ms ease,
    padding 180ms ease;
}

.valaxy-girl-detail-reason-hover:hover .valaxy-girl-detail-reason,
.valaxy-girl-detail-reason-hover:focus-within .valaxy-girl-detail-reason {
  max-height: 3.2rem;
  margin-top: 0.42rem;
  padding-top: 0.35rem;
  border-top: 1px dashed var(--valaxy-girls-line);
  opacity: 1;
}

.valaxy-girl-detail-link {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  color: var(--valaxy-girls-muted);
  border-radius: 50%;
  font-size: 0.8rem;
  text-decoration: none;
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.valaxy-girl-detail-link:hover,
.valaxy-girl-detail-link:focus-visible {
  color: var(--valaxy-girls-sky-deep);
  background: var(--valaxy-girls-soft);
}

.valaxy-girl-detail-link:focus-visible {
  outline: 2px solid var(--valaxy-girls-sky);
  outline-offset: 2px;
}

@media (hover: none) {
  .valaxy-girl-detail-reason-hover .valaxy-girl-detail-reason {
    max-height: 3.2rem;
    margin-top: 0.42rem;
    padding-top: 0.35rem;
    border-top: 1px dashed var(--valaxy-girls-line);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girl-detail-reason,
  .valaxy-girl-detail-link {
    transition: none;
  }
}
</style>
