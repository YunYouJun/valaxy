<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { GirlEntry, GirlReasonMode } from '../types'
import { computed, shallowRef, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  girl: GirlEntry
  index: number
  reasonMode?: GirlReasonMode
}>(), {
  reasonMode: 'hidden',
})

const { t } = useI18n()
const imageFailed = shallowRef(!props.girl.avatar)
const reasonId = useId()
const characterUrl = computed(() => (
  props.girl.url || `https://zh.moegirl.org.cn/${encodeURIComponent(props.girl.name)}`
))
const characterNumber = computed(() => (props.index + 1).toString().padStart(2, '0'))
const cardClasses = computed(() => ({
  'valaxy-girl-card': true,
  [`valaxy-girl-card-reason-${props.reasonMode}`]: true,
}))
const showReason = computed(() => Boolean(props.girl.reason) && props.reasonMode !== 'hidden')
const itemStyle = computed<CSSProperties>(() => ({
  animationDelay: `${Math.min(props.index, 12) * 35}ms`,
}))

watch(() => props.girl.avatar, avatar => imageFailed.value = !avatar)

function handleImageError() {
  imageFailed.value = true
}
</script>

<template>
  <li class="valaxy-girl-item" :style="itemStyle">
    <a
      :class="cardClasses"
      :href="characterUrl"
      :aria-describedby="showReason ? reasonId : undefined"
      :aria-label="t(
        'addon.girls.profile',
        { name: girl.name },
        `View ${girl.name}'s profile`,
      )"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="valaxy-girl-number" aria-hidden="true">{{ characterNumber }}</span>

      <figure class="valaxy-girl-figure">
        <div class="valaxy-girl-portrait">
          <img
            v-if="!imageFailed"
            class="valaxy-girl-avatar"
            :src="girl.avatar"
            :alt="girl.name"
            loading="lazy"
            decoding="async"
            @error="handleImageError"
          >
          <span v-else class="valaxy-girl-avatar-fallback" aria-hidden="true">
            {{ girl.name.slice(0, 1) }}
          </span>
        </div>

        <figcaption class="valaxy-girl-caption">
          <strong class="valaxy-girl-name">{{ girl.name }}</strong>
          <span v-if="girl.from" class="valaxy-girl-from">{{ girl.from }}</span>
          <p v-if="showReason" :id="reasonId" class="valaxy-girl-reason">
            {{ girl.reason }}
          </p>
        </figcaption>
      </figure>
    </a>
  </li>
</template>

<style scoped>
.valaxy-girl-item {
  min-width: 0;
  contain-intrinsic-size: auto 4.75rem;
  content-visibility: auto;
  list-style: none;
  animation: valaxy-girl-card-enter 480ms cubic-bezier(0.2, 0.75, 0.25, 1) both;
}

.valaxy-girl-card {
  position: relative;
  display: block;
  height: 100%;
  overflow: hidden;
  color: var(--valaxy-girls-ink);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--va-c-primary) 4%, var(--valaxy-girls-paper)),
    var(--valaxy-girls-paper) 52%
  );
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 0.65rem;
  box-shadow: 0 0.35rem 1rem rgb(49 64 85 / 0.06);
  text-decoration: none;
  transform: translateY(0);
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    transform 220ms ease;
}

.valaxy-girl-card::after {
  position: absolute;
  top: 0.62rem;
  right: 0.65rem;
  color: var(--valaxy-girls-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1;
  opacity: 0.45;
  content: '↗';
  transform: translate(-0.12rem, 0.12rem);
  transition:
    color 180ms ease,
    opacity 180ms ease,
    transform 180ms ease;
}

.valaxy-girl-card:hover {
  border-color: var(--valaxy-girls-sky);
  box-shadow:
    0 0.55rem 1.25rem rgb(63 153 190 / 0.14),
    0 0 0 2px color-mix(in srgb, var(--valaxy-girls-sky) 12%, transparent);
  transform: translateY(-0.14rem);
}

.valaxy-girl-card:hover::after,
.valaxy-girl-card:focus-visible::after {
  color: var(--valaxy-girls-sky-deep);
  opacity: 0.9;
  transform: translate(0, 0);
}

.valaxy-girl-card:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--valaxy-girls-sky) 48%, transparent);
  outline-offset: 3px;
}

.valaxy-girl-number {
  position: absolute;
  z-index: 2;
  top: 0.42rem;
  left: 0.42rem;
  min-width: 1.6rem;
  padding: 0.18rem 0.32rem;
  color: #fff;
  background: rgb(31 46 64 / 0.66);
  border: 1px solid rgb(255 255 255 / 0.38);
  border-radius: 999px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
  text-align: center;
  backdrop-filter: blur(0.4rem);
}

.valaxy-girl-figure {
  display: grid;
  min-height: 4.75rem;
  height: 100%;
  grid-template-columns: 3.75rem minmax(0, 1fr);
  margin: 0;
}

.valaxy-girl-portrait {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 75% 18%,
      color-mix(in srgb, var(--valaxy-girls-blush) 18%, transparent),
      transparent 36%
    ),
    var(--valaxy-girls-soft);
}

.valaxy-girl-avatar,
.valaxy-girl-avatar-fallback {
  display: block;
  width: 100%;
  height: 100%;
}

.valaxy-girl-avatar {
  max-width: none;
  margin: 0;
  object-fit: cover;
  object-position: center top;
  filter: saturate(0.94);
  transform: scale(1.001);
  transition:
    filter 300ms ease,
    transform 500ms cubic-bezier(0.2, 0.75, 0.25, 1);
}

.valaxy-girl-card:hover .valaxy-girl-avatar,
.valaxy-girl-card:focus-visible .valaxy-girl-avatar {
  filter: saturate(1.06);
  transform: scale(1.045);
}

.valaxy-girl-avatar-fallback {
  display: grid;
  place-items: center;
  color: var(--valaxy-girls-sky-deep);
  font-family: var(--va-font-serif);
  font-size: clamp(2rem, 7vw, 3.25rem);
  font-weight: 800;
}

.valaxy-girl-reason {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.6rem;
  line-height: 1.42;
  text-align: left;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.valaxy-girl-card-reason-inline .valaxy-girl-figure {
  min-height: 6.25rem;
}

.valaxy-girl-card-reason-inline .valaxy-girl-reason {
  margin: 0.42rem 0 0;
  padding-top: 0.36rem;
  color: var(--valaxy-girls-muted);
  border-top: 1px dashed color-mix(in srgb, var(--valaxy-girls-sky) 34%, var(--valaxy-girls-line));
}

.valaxy-girl-card-reason-hover .valaxy-girl-reason {
  position: absolute;
  z-index: 3;
  right: 0.42rem;
  bottom: 0.42rem;
  left: 0.42rem;
  margin: 0;
  padding: 0.45rem 0.5rem;
  color: var(--valaxy-girls-ink);
  background: color-mix(in srgb, var(--valaxy-girls-paper) 92%, transparent);
  border: 1px solid var(--valaxy-girls-line);
  border-radius: 0.45rem;
  box-shadow: 0 0.35rem 1rem rgb(31 46 64 / 0.16);
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.3rem);
  transition:
    opacity 180ms ease,
    transform 180ms ease;
  backdrop-filter: blur(0.7rem);
}

.valaxy-girl-card-reason-hover:hover .valaxy-girl-reason,
.valaxy-girl-card-reason-hover:focus-visible .valaxy-girl-reason {
  opacity: 1;
  transform: translateY(0);
}

.valaxy-girl-reason::before {
  color: var(--valaxy-girls-blush);
  font-weight: 800;
  content: '♡ ';
}

.valaxy-girl-caption {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: 0.52rem 1.65rem 0.52rem 0.62rem;
  text-align: left;
}

.valaxy-girl-name,
.valaxy-girl-from {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valaxy-girl-name {
  color: var(--valaxy-girls-ink);
  font-family: var(--va-font-serif);
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.valaxy-girl-from {
  margin-top: 0.16rem;
  color: var(--valaxy-girls-muted);
  font-size: 0.53rem;
  letter-spacing: 0.04em;
  line-height: 1.45;
  text-transform: uppercase;
}

@keyframes valaxy-girl-card-enter {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girl-item {
    animation: none;
  }

  .valaxy-girl-card,
  .valaxy-girl-avatar,
  .valaxy-girl-reason {
    transition: none;
  }
}

@media (hover: none) {
  .valaxy-girl-card:hover {
    box-shadow: 0 0.35rem 1rem rgb(49 64 85 / 0.06);
    transform: none;
  }
}

@media (width <= 22rem) {
  .valaxy-girl-figure {
    grid-template-columns: 4.25rem minmax(0, 1fr);
  }
}
</style>
