<script setup lang="ts">
import type { MenuItem } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { normalizeOutlineHash } from '../utils'

const props = defineProps<{
  headers: MenuItem[]
  onClick: (e: MouseEvent) => void
  root?: boolean
  collapsible?: boolean
  collapsedLinks?: Set<string>
  activeAncestors?: Set<string>
  onToggle?: (link: string) => void
  onTransitionEnd?: (e: TransitionEvent) => void
}>()

const { locale, t } = useI18n()

function isCollapsed(link: string): boolean {
  return !!props.collapsible && !!props.collapsedLinks?.has(normalizeOutlineHash(link))
}

function hasActiveChild(link: string): boolean {
  return isCollapsed(link) && !!props.activeAncestors?.has(normalizeOutlineHash(link))
}

function isToggleVisible(children?: MenuItem[], lang?: string): boolean {
  return !!props.collapsible && !!children?.length && (!lang || lang === locale.value)
}

function getBranchId(link: string, index: number): string {
  const sanitized = normalizeOutlineHash(link)
    .replace(/^#/, '')
    .replace(/[^\w-]/g, '_')
    .slice(0, 48)
  return `yun-outline-branch-${index}-${sanitized || 'section'}`
}
</script>

<template>
  <ul :class="root ? 'root' : 'nested'">
    <li
      v-for="({ children, link, title, lang }, idx) in headers"
      :key="link"
      class="va-toc-item"
      :class="{ 'has-active-child': hasActiveChild(link) }"
      :lang="lang || locale"
    >
      <a class="outline-link" :href="link" @click="onClick">{{ title }}</a>
      <button
        v-if="isToggleVisible(children, lang)"
        type="button"
        class="outline-item-toggle"
        :aria-expanded="!isCollapsed(link)"
        :aria-controls="getBranchId(link, idx)"
        :aria-label="t('theme.toggleSection', { title })"
        @click.stop="onToggle?.(link)"
      >
        <span
          i-ri-arrow-right-s-line
          class="outline-chevron"
          :class="{ 'is-open': !isCollapsed(link) }"
          aria-hidden="true"
        />
      </button>

      <div
        v-if="children?.length"
        :id="getBranchId(link, idx)"
        class="outline-children-wrap"
        :class="{ 'is-collapsed': isCollapsed(link) }"
        :data-outline-collapsed="isCollapsed(link) ? 'true' : undefined"
        :aria-hidden="isCollapsed(link) ? 'true' : undefined"
        @transitionend="onTransitionEnd"
      >
        <div class="outline-children-inner">
          <YunOutlineItem
            :headers="children"
            :on-click="onClick"
            :collapsible="collapsible"
            :collapsed-links="collapsedLinks"
            :active-ancestors="activeAncestors"
            :on-toggle="onToggle"
            :on-transition-end="onTransitionEnd"
          />
        </div>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.va-toc {
  .va-toc-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 2px;

    &.has-active-child > .outline-link {
      color: var(--va-c-primary-lighter);
      font-weight: 500;
    }

    .outline-link {
      display: block;
      grid-column: 1;
      min-width: 0;
      line-height: 28px;
      color: var(--va-c-text-light);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color var(--va-transition-duration-moderate);

      &:hover,
      &.active {
        color: var(--va-c-primary-lighter);
        transition: color var(--va-transition-duration);
      }
    }

    .outline-item-toggle {
      display: inline-flex;
      grid-column: 2;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      padding: 0;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--va-c-text-3, var(--va-c-text-light));
      cursor: pointer;
      transition:
        color var(--va-transition-duration-fast, 160ms) ease,
        background-color var(--va-transition-duration-fast, 160ms) ease;

      &:hover {
        color: var(--va-c-primary);
        background-color: var(--yun-action-btn-hover-bg, rgb(0 120 231 / 0.08));
      }

      &:focus-visible {
        outline: 2px solid var(--yun-focus-color, var(--va-c-primary));
        outline-offset: 1px;
      }
    }

    .outline-chevron {
      font-size: 14px;
      transition: transform var(--va-transition-duration-fast, 180ms) var(--yun-ease-in, ease);

      &.is-open {
        transform: rotate(90deg);
      }
    }

    .outline-children-wrap {
      grid-column: 1 / -1;
      display: grid;
      grid-template-rows: 1fr;
      opacity: 1;
      transition:
        grid-template-rows var(--va-transition-duration-fast, 200ms) var(--yun-ease-in, cubic-bezier(0.18, 0.66, 0.05, 0.96)),
        opacity var(--va-transition-duration-fast, 200ms) ease,
        visibility 0s linear 0s;

      &.is-collapsed {
        grid-template-rows: 0fr;
        opacity: 0;
        visibility: hidden;
        transition:
          grid-template-rows var(--va-transition-duration-fast, 200ms) var(--yun-ease-in, cubic-bezier(0.18, 0.66, 0.05, 0.96)),
          opacity var(--va-transition-duration-fast, 200ms) ease,
          visibility 0s linear var(--va-transition-duration-fast, 200ms);
      }
    }

    .outline-children-inner {
      min-height: 0;
      overflow: hidden;
    }

    .nested {
      padding-left: 0.75rem;
      border-left: 1px solid var(--yun-surface-line, rgb(127 127 127 / 0.16));
      margin-left: 0.2rem;
    }
  }
}

@media (pointer: coarse) {
  .va-toc {
    .va-toc-item {
      .outline-item-toggle {
        width: 32px;
        height: 28px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .va-toc {
    .va-toc-item {
      .outline-item-toggle,
      .outline-chevron,
      .outline-children-wrap,
      .outline-children-wrap.is-collapsed {
        transition: none;
      }
    }
  }
}
</style>
