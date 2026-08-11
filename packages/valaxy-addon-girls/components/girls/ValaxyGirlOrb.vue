<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { GirlEntry } from '../../types'
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface OrbStyle extends CSSProperties {
  '--valaxy-girl-orb-size': string
}

const props = withDefaults(defineProps<{
  girl: GirlEntry
  index: number
  packed?: boolean
  selected?: boolean
  size?: number | string
}>(), {
  packed: false,
  selected: false,
  size: 4,
})

const emit = defineEmits<{
  select: []
}>()

const { t } = useI18n()
const imageFailed = shallowRef(!props.girl.avatar)
const orbStyle = computed<OrbStyle>(() => ({
  '--valaxy-girl-orb-size': typeof props.size === 'number' ? `${props.size}rem` : props.size,
}))

watch(() => props.girl.avatar, avatar => imageFailed.value = !avatar)

function handleImageError() {
  imageFailed.value = true
}
</script>

<template>
  <button
    class="valaxy-girl-orb"
    :class="{
      'valaxy-girl-orb-packed': packed,
      'valaxy-girl-orb-selected': selected,
    }"
    :style="orbStyle"
    type="button"
    :aria-label="t(
      'addon.girls.select',
      { name: girl.name },
      `Show ${girl.name}`,
    )"
    :aria-pressed="selected"
    @click="emit('select')"
  >
    <span class="valaxy-girl-orb-portrait">
      <img
        v-if="!imageFailed"
        class="valaxy-girl-orb-avatar"
        :src="girl.avatar"
        alt=""
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      >
      <span v-else class="valaxy-girl-orb-fallback" aria-hidden="true">
        {{ girl.name.slice(0, 1) }}
      </span>
    </span>
    <span class="valaxy-girl-orb-label" aria-hidden="true">
      <strong class="valaxy-girl-orb-label-name">{{ girl.name }}</strong>
      <span v-if="girl.from" class="valaxy-girl-orb-label-from">{{ girl.from }}</span>
    </span>
  </button>
</template>

<style scoped>
.valaxy-girl-orb {
  position: relative;
  display: block;
  width: var(--valaxy-girl-orb-size);
  height: var(--valaxy-girl-orb-size);
  flex: none;
  padding: 0;
  color: var(--valaxy-girls-ink);
  background: var(--valaxy-girls-paper);
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  transform: translateY(0) scale(1);
  transition:
    filter 220ms ease,
    transform 220ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

.valaxy-girl-orb::before {
  position: absolute;
  z-index: -1;
  inset: -0.2rem;
  background: var(--valaxy-girls-paper);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: inherit;
  box-shadow: 0 0.35rem 1rem rgb(49 64 85 / 0.12);
  content: '';
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.valaxy-girl-orb-packed::before {
  inset: -1px;
  box-shadow: 0 0.2rem 0.65rem rgb(49 64 85 / 0.14);
}

.valaxy-girl-orb:hover,
.valaxy-girl-orb:focus-visible,
.valaxy-girl-orb-selected {
  z-index: 5;
  filter: saturate(1.06);
  transform: translateY(-0.18rem) scale(1.045);
}

.valaxy-girl-orb:hover::before,
.valaxy-girl-orb:focus-visible::before,
.valaxy-girl-orb-selected::before {
  border-color: var(--valaxy-girls-sky);
  box-shadow:
    0 0.55rem 1.25rem rgb(63 153 190 / 0.18),
    0 0 0 0.16rem color-mix(in srgb, var(--valaxy-girls-sky) 18%, transparent);
}

.valaxy-girl-orb:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--valaxy-girls-sky) 52%, transparent);
  outline-offset: 0.35rem;
}

.valaxy-girl-orb-portrait,
.valaxy-girl-orb-avatar,
.valaxy-girl-orb-fallback {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.valaxy-girl-orb-portrait {
  overflow: hidden;
}

.valaxy-girl-orb-avatar {
  max-width: none;
  margin: 0;
  object-fit: cover;
  object-position: center top;
  transform: scale(1.01);
  transition: transform 420ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

.valaxy-girl-orb:hover .valaxy-girl-orb-avatar,
.valaxy-girl-orb:focus-visible .valaxy-girl-orb-avatar,
.valaxy-girl-orb-selected .valaxy-girl-orb-avatar {
  transform: scale(1.07);
}

.valaxy-girl-orb-fallback {
  display: grid;
  place-items: center;
  color: var(--valaxy-girls-sky-deep);
  background: var(--valaxy-girls-soft);
  font-family: var(--va-font-serif);
  font-size: calc(var(--valaxy-girl-orb-size) * 0.42);
  font-weight: 800;
}

.valaxy-girl-orb-label {
  position: absolute;
  z-index: 6;
  top: calc(100% + 0.45rem);
  left: 50%;
  display: grid;
  width: max-content;
  max-width: min(11rem, 42vw);
  padding: 0.35rem 0.55rem;
  color: var(--valaxy-girls-ink);
  background: color-mix(in srgb, var(--valaxy-girls-paper) 94%, transparent);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.7rem rgb(31 46 64 / 0.12);
  font-size: 0.64rem;
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -0.2rem);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
  white-space: nowrap;
  backdrop-filter: blur(0.6rem);
}

.valaxy-girl-orb-label-name,
.valaxy-girl-orb-label-from {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valaxy-girl-orb-label-name {
  font-weight: 700;
}

.valaxy-girl-orb-label-from {
  margin-top: 0.16rem;
  color: var(--valaxy-girls-muted);
  font-size: 0.56rem;
}

.valaxy-girl-orb:hover .valaxy-girl-orb-label,
.valaxy-girl-orb:focus-visible .valaxy-girl-orb-label {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girl-orb,
  .valaxy-girl-orb-avatar,
  .valaxy-girl-orb-label {
    transition: none;
  }
}
</style>
