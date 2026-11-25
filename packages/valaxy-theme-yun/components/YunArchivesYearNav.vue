<script setup lang="ts">
import type { ArchiveYearSummary } from '../composables'
import { useFrontmatter } from 'valaxy'
import { computed, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  years: ArchiveYearSummary[]
  activeYear?: number | null
}>(), {
  activeYear: null,
})

const emit = defineEmits<{
  selectYear: [year: number]
}>()

const { t } = useI18n()
const frontmatter = useFrontmatter()
const showToc = computed(() => frontmatter.value.toc !== false && frontmatter.value.outline !== false)
const railInnerRef = useTemplateRef<HTMLElement>('railInnerRef')
const linkRefs = useTemplateRef<HTMLAnchorElement[]>('linkRefs')
const markerTop = shallowRef(28)

function updateMarker() {
  const container = railInnerRef.value
  const links = linkRefs.value
  if (!container || !links?.length || props.activeYear == null)
    return

  const targetYear = String(props.activeYear)
  const target = links.find(el => el.dataset.year === targetYear) ?? links[0]
  if (!target)
    return

  const centerOffset = target.offsetHeight ? Math.round((target.offsetHeight - 18) / 2) : 5
  markerTop.value = target.offsetTop + centerOffset
}

const markerStyle = computed(() => ({
  top: `${markerTop.value}px`,
  opacity: props.activeYear == null ? '0' : '1',
}))

const maxCount = computed(() => Math.max(1, ...props.years.map(item => item.count)))

function onYearLinkClick(event: MouseEvent, year: number) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return
  event.preventDefault()
  emit('selectYear', year)
}

watch(() => [props.activeYear, props.years], () => {
  updateMarker()
}, { flush: 'post' })

onMounted(() => {
  updateMarker()
})
</script>

<template>
  <aside class="yun-aside yun-archives-rail" :aria-label="t('theme.archiveYears')">
    <div class="yun-aside-progress" aria-hidden="true">
      <span class="yun-aside-progress-bar" />
    </div>
    <div class="yun-archives-rail-content">
      <YunOutline v-if="showToc" class="yun-archives-rail-outline" />
      <div ref="railInnerRef" class="yun-archives-rail-inner">
        <div class="yun-archives-rail-title">
          {{ t('theme.archiveYears') }}
        </div>
        <div class="yun-archives-rail-marker" :style="markerStyle" aria-hidden="true" />
        <nav :aria-label="t('theme.archiveYears')">
          <ul class="yun-archives-rail-list">
            <li v-for="item in years" :key="item.year" class="yun-archives-rail-item">
              <a
                ref="linkRefs"
                :href="`#archive-year-${item.year}`"
                :data-year="item.year"
                class="yun-archives-rail-link"
                :class="{ active: activeYear === item.year }"
                :aria-current="activeYear === item.year ? 'location' : undefined"
                data-valaxy-native-link
                @click="onYearLinkClick($event, item.year)"
              >
                <span class="yun-archives-rail-year">{{ item.year }}</span>
                <span class="yun-archives-rail-meta">
                  <span class="yun-archives-rail-meter" aria-hidden="true">
                    <span
                      class="yun-archives-rail-meter-fill"
                      :style="{ width: `${Math.max(16, Math.round((item.count / maxCount) * 100))}%` }"
                    />
                  </span>
                  <span class="yun-archives-rail-count">{{ item.count }}</span>
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.yun-archives-rail {
  display: none;
}

.yun-aside-progress {
  position: sticky;
  top: 0;
  z-index: 3;
  flex: none;
  width: 100%;
  height: 2px;
  margin-bottom: -2px;
  overflow: hidden;
  border-radius: 999px;
  pointer-events: none;
}

.yun-aside-progress-bar {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--va-c-link) 62%, transparent),
    color-mix(in srgb, var(--va-c-primary) 72%, transparent)
  );
  transform: scaleX(0);
  transform-origin: left center;
}

@keyframes yun-aside-progress {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@supports (animation-timeline: scroll(root)) {
  .yun-aside-progress-bar {
    animation: yun-aside-progress linear both;
    animation-timeline: scroll(root);
  }
}

@media (width >= 1280px) {
  .yun-archives-rail {
    position: sticky;
    top: var(--yun-margin-top);
    z-index: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    min-height: 0;
    max-height: calc(100vh - var(--yun-margin-top) - 1rem);
    overflow-y: auto;
    visibility: visible;
    transform: none;
    background-color: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    text-align: left;
  }
}

.yun-archives-rail-content {
  padding-block: 0.5rem;
}

.yun-archives-rail-outline {
  margin-bottom: 1rem;
}

.yun-archives-rail-inner {
  position: relative;
  border-left: 1px solid var(--yun-surface-line);
  padding-inline: 14px 8px;
  font-size: 0.875rem;
}

.yun-archives-rail-title {
  min-height: 28px;
  line-height: 28px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--va-c-text-2);
  letter-spacing: 0.02em;
}

.yun-archives-rail-marker {
  position: absolute;
  top: 28px;
  left: -1.5px;
  z-index: 0;
  width: 2px;
  height: 18px;
  border-radius: 999px;
  background-color: var(--va-c-brand);
  transition:
    top var(--va-transition-duration) cubic-bezier(0, 1, 0.5, 1),
    opacity var(--va-transition-duration);
}

.yun-archives-rail-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.yun-archives-rail-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 28px;
  padding-block: 0.15rem;
  border-radius: 0.375rem;
  color: var(--va-c-text-light);
  text-decoration: none;
  font-variant-numeric: tabular-nums;
  transition: color var(--va-transition-duration-fast, 160ms) ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--va-c-primary-lighter);
    }
  }

  &.active {
    color: var(--va-c-primary-lighter);
    font-weight: 600;
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }
}

.yun-archives-rail-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.yun-archives-rail-meter {
  position: relative;
  display: inline-block;
  width: 28px;
  height: 2px;
  overflow: hidden;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--yun-surface-line) 75%, transparent);
}

.yun-archives-rail-meter-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background-color: color-mix(in srgb, var(--va-c-text-3) 55%, transparent);
  transition: background-color var(--va-transition-duration-fast, 160ms) ease;
}

@media (hover: hover) and (pointer: fine) {
  .yun-archives-rail-link:hover .yun-archives-rail-meter-fill {
    background-color: var(--va-c-link);
  }
}

.yun-archives-rail-link.active .yun-archives-rail-meter-fill {
  background-color: var(--va-c-link);
}

.yun-archives-rail-count {
  min-width: 1.5rem;
  font-size: 0.75rem;
  text-align: right;
  color: var(--va-c-text-2);
}

@media (prefers-reduced-motion: reduce) {
  .yun-aside-progress-bar {
    animation: none;
    transform: scaleX(0);
  }

  .yun-archives-rail-marker,
  .yun-archives-rail-link,
  .yun-archives-rail-meter-fill {
    transition: none;
  }
}
</style>

<style lang="scss">
@media (width >= 1280px) {
  html[data-yun-custom-bg='true'] .yun-archives-rail {
    padding: 0.75rem 0.25rem;
    border: 1px solid var(--yun-surface-line);
    border-radius: var(--va-card-border-radius, 0.5rem);
    background-color: color-mix(in srgb, var(--va-c-bg-light) 78%, transparent);
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
  }
}
</style>
