<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { groupPostsByYear } from '../utils'

const props = withDefaults(defineProps<{
  posts: Post[]
  activeYear?: number | null
  showYearPills?: boolean
}>(), {
  activeYear: null,
  showYearPills: false,
})

defineEmits<{
  selectYear: [year: number]
}>()

const isDesc = defineModel<boolean>('desc', { default: true })

const { t } = useI18n()
const siteConfig = useSiteConfig()

const sortLabel = computed(() => isDesc.value ? t('theme.sortDesc') : t('theme.sortAsc'))
const yearGroups = computed(() => groupPostsByYear(props.posts, siteConfig.value.orderBy, isDesc.value, siteConfig.value.timezone))
const collectionCount = computed(() => props.posts.filter(post => Boolean(post._collection)).length)
const articleCount = computed(() => props.posts.length - collectionCount.value)
</script>

<template>
  <div class="post-collapse relative">
    <div class="yun-archive-toolbar">
      <Transition appear enter-active-class="animate-fade-in animate-duration-400">
        <div class="yun-archive-total yun-text-light">
          <span>{{ t('counter.archives', articleCount) }}</span>
          <template v-if="collectionCount > 0">
            <span class="yun-archive-total-sep" aria-hidden="true">·</span>
            <span class="yun-archive-total-collections">{{ t('theme.archiveCollections', collectionCount) }}</span>
          </template>
        </div>
      </Transition>

      <button
        type="button"
        class="yun-action-btn yun-collapse-sort-btn"
        :title="sortLabel"
        :aria-label="sortLabel"
        :aria-pressed="!isDesc"
        @click="isDesc = !isDesc"
      >
        <span :class="isDesc ? 'i-ri-sort-desc' : 'i-ri-sort-asc'" aria-hidden="true" />
      </button>
    </div>

    <nav
      v-if="showYearPills && yearGroups.length > 1"
      class="yun-archive-year-pills"
      :aria-label="t('theme.archiveYears')"
    >
      <button
        v-for="group in yearGroups"
        :key="group.year"
        type="button"
        class="yun-archive-year-pill"
        :class="{ active: activeYear === group.year }"
        :aria-current="activeYear === group.year ? 'location' : undefined"
        @click="$emit('selectYear', group.year)"
      >
        <span>{{ group.year }}</span>
        <span class="yun-archive-year-pill-count">{{ group.posts.length }}</span>
      </button>
    </nav>

    <div class="yun-timeline">
      <section
        v-for="group in yearGroups"
        :key="group.year"
        class="yun-timeline-year"
        :class="{ 'is-active': activeYear === group.year }"
      >
        <div class="yun-timeline-year-header">
          <h2 :id="`archive-year-${group.year}`" class="archive-year" tabindex="-1">
            {{ group.year }}
          </h2>
          <span class="yun-timeline-year-count">{{ group.posts.length }}</span>
        </div>

        <div class="yun-timeline-items">
          <YunPostCollapseItem
            v-for="(post, j) in group.posts"
            :key="post.path || `${group.year}-${j}`"
            :post="post"
            :i="j"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.yun-collapse-sort-btn.yun-action-btn {
  border: 1px solid var(--yun-surface-line);
  background-color: var(--yun-bg-elevated, var(--va-c-bg-light));

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: color-mix(in srgb, var(--va-c-link) 32%, var(--yun-surface-line));
      color: var(--va-c-link);
      background-color: color-mix(in srgb, var(--va-c-link) 6%, var(--yun-bg-elevated, var(--va-c-bg-light)));
    }
  }
}

.post-collapse {
  --yun-timeline-line-color: var(--yun-surface-line);

  width: 100%;

  .yun-archive-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .yun-archive-total {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.45rem;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  .yun-archive-total-sep {
    opacity: 0.5;
  }

  .yun-archive-total-collections {
    color: var(--va-c-text-2);
  }

  .yun-archive-year-pills {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 0.15rem 0 0.9rem;
    margin-bottom: 0.5rem;

    &::-webkit-scrollbar {
      display: none;
    }

    @media (width >= 1280px) {
      display: none;
    }
  }

  .yun-archive-year-pill {
    display: inline-flex;
    align-items: center;
    flex: none;
    gap: 0.3rem;
    padding: 0.25rem 0.625rem;
    border: 1px solid var(--yun-surface-line);
    border-radius: 999px;
    background-color: var(--yun-bg-elevated, var(--va-c-bg-light));
    color: var(--va-c-text-2);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition:
      color 160ms ease,
      border-color 160ms ease,
      background-color 160ms ease;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: var(--va-c-link);
        border-color: color-mix(in srgb, var(--va-c-link) 30%, var(--yun-surface-line));
      }
    }

    &.active {
      color: var(--va-c-link);
      border-color: color-mix(in srgb, var(--va-c-link) 35%, transparent);
      background-color: color-mix(in srgb, var(--va-c-link) 10%, transparent);
      font-weight: 600;
    }

    &:focus-visible {
      outline: 2px solid var(--yun-focus-color);
      outline-offset: 2px;
    }
  }

  .yun-archive-year-pill-count {
    font-size: 0.6875rem;
  }

  .yun-timeline-year {
    position: relative;
    padding-bottom: 1.75rem;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 5px;
      z-index: 1;
      width: 1px;
      background: var(--yun-timeline-line-color);
    }

    &:first-child::before {
      top: 1.05rem;
    }

    &:last-child {
      padding-bottom: 0.5rem;

      &::before {
        background: linear-gradient(
          to bottom,
          var(--yun-timeline-line-color) 0%,
          var(--yun-timeline-line-color) 65%,
          transparent 100%
        );
      }
    }
  }

  .yun-timeline-year-header {
    position: relative;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0 0 0.55rem 1.75rem;
    margin-bottom: 0.35rem;
    border-bottom: 1px solid var(--yun-surface-line);

    &::before {
      content: '';
      position: absolute;
      top: 0.65rem;
      left: 0;
      z-index: 2;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--va-c-text-3) 65%, var(--yun-surface-line));
      background-color: var(--va-c-bg-light);
      transition:
        border-color 180ms ease,
        background-color 180ms ease,
        box-shadow 180ms ease;
    }

    .archive-year {
      margin: 0;
      font-family: var(--va-font-serif);
      font-size: 1.625rem;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: -0.01em;
      color: var(--va-c-text-1, var(--va-c-text));
      font-variant-numeric: tabular-nums;
      scroll-margin-top: calc(var(--yun-margin-top, 68px) + 1rem);
      transition: color 180ms ease;

      &:focus {
        outline: none;
      }

      &:focus-visible {
        outline: 2px solid var(--yun-focus-color);
        outline-offset: 4px;
        border-radius: 4px;
      }
    }
  }

  .yun-timeline-year.is-active > .yun-timeline-year-header {
    &::before {
      border-color: var(--va-c-link);
      background-color: var(--va-c-link);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--va-c-link) 16%, transparent);
    }

    .archive-year {
      color: var(--va-c-link);
    }
  }

  .yun-timeline-year-count {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--va-c-text-2);
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .yun-archive-year-pill,
    .yun-timeline-year-header::before,
    .yun-timeline-year-header .archive-year {
      transition: none;
    }
  }
}
</style>
