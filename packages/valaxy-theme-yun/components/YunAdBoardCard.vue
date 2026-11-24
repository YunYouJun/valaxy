<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  to?: string
  href?: string
  target?: string
  icon?: string | false
  badge?: string
  align?: 'center' | 'start'
  flush?: boolean
}>(), {
  icon: 'i-ri-megaphone-line',
  align: 'center',
  flush: false,
})

const slots = useSlots()

const linkTarget = computed(() => props.href || props.to || '')
const isExternalLink = computed(() => {
  return Boolean((linkTarget.value && /^(?:[a-z]+:|\/\/)/i.test(linkTarget.value)) || props.target === '_blank')
})
const linkRel = computed(() => (isExternalLink.value ? 'noopener noreferrer' : undefined))
const resolvedIcon = computed(() => (props.icon === false ? '' : props.icon))

const hasHeader = computed(() => Boolean(slots.header || props.title || props.badge))
const hasBody = computed(() => Boolean(slots.default))
const hasFooter = computed(() => Boolean(slots.footer))
</script>

<template>
  <div
    class="yun-ad-board-card"
    :class="[
      `is-align-${align}`,
      { 'is-flush': flush },
    ]"
  >
    <div v-if="hasHeader" class="yun-ad-board-header">
      <slot name="header">
        <AppLink
          v-if="linkTarget && title"
          class="yun-ad-board-title yun-ad-board-title-link"
          :class="{ 'is-external': isExternalLink }"
          :to="to"
          :href="href"
          :target="target"
          :rel="linkRel"
        >
          <span v-if="resolvedIcon" class="yun-ad-board-icon" :class="resolvedIcon" aria-hidden="true" />
          <span class="yun-ad-board-title-text">{{ title }}</span>
          <span
            class="yun-ad-board-arrow"
            :class="isExternalLink ? 'i-ri-arrow-right-up-line' : 'i-ri-arrow-right-s-line'"
            aria-hidden="true"
          />
        </AppLink>
        <div v-else-if="title" class="yun-ad-board-title">
          <span v-if="resolvedIcon" class="yun-ad-board-icon" :class="resolvedIcon" aria-hidden="true" />
          <span class="yun-ad-board-title-text">{{ title }}</span>
        </div>
        <span v-if="badge" class="yun-ad-board-badge">
          {{ badge }}
        </span>
      </slot>
    </div>

    <YunGradientDivider v-if="hasHeader && hasBody && !flush" class="yun-ad-board-divider" />

    <div v-if="hasBody" class="yun-ad-board-body">
      <slot />
    </div>

    <div v-if="hasFooter" class="yun-ad-board-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss">
.yun-ad-board-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
  overflow: hidden;
  border: 1px solid var(--yun-surface-line);
  border-radius: var(--va-card-border-radius, 0.5rem);
  background-color: var(--va-c-bg-light);
  color: var(--va-c-text);
  box-shadow: 0 2px 10px -4px rgb(20 35 60 / 0.06);
  transition: border-color 200ms ease, box-shadow 200ms ease;

  &.is-flush {
    padding: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: color-mix(in srgb, var(--va-c-link) 28%, var(--yun-surface-line));
      box-shadow: var(--yun-card-hover-shadow);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

html.dark .yun-ad-board-card {
  box-shadow: 0 4px 14px -4px rgb(0 0 0 / 0.35);
}

.yun-ad-board-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
}

.yun-ad-board-card.is-align-start .yun-ad-board-header {
  justify-content: space-between;
  gap: 0.5rem;
}

.yun-ad-board-card.is-flush .yun-ad-board-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--yun-surface-line);
}

.yun-ad-board-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  max-width: 100%;
  color: var(--va-c-text);
  font-family: var(--va-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.5;
  text-decoration: none;
}

.yun-ad-board-title-text {
  min-width: 0;
  overflow-wrap: anywhere;
}

.yun-ad-board-icon {
  flex-shrink: 0;
  font-size: 1rem;
  color: var(--va-c-link);
  opacity: 0.9;
}

.yun-ad-board-arrow {
  flex-shrink: 0;
  font-size: 0.95rem;
  opacity: 0.72;
  transition: transform 180ms ease, opacity 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.yun-ad-board-title-link {
  border-radius: 0.25rem;
  color: var(--va-c-link);
  transition: color 180ms ease;

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      .yun-ad-board-arrow {
        opacity: 1;

        @media (prefers-reduced-motion: no-preference) {
          transform: translateX(2px);
        }
      }

      &.is-external .yun-ad-board-arrow {
        @media (prefers-reduced-motion: no-preference) {
          transform: translate(1px, -1px);
        }
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.yun-ad-board-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.45rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--va-c-text) 3.5%, transparent);
  color: var(--va-c-text-3);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.3;
}

.yun-ad-board-divider {
  margin: 0.625rem 0;
}

.yun-ad-board-body {
  width: 100%;
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.65;
  text-align: center;
  overflow-wrap: anywhere;

  p {
    margin: 0;
  }

  p + p {
    margin-top: 0.375rem;
  }

  a {
    border-radius: 0.25rem;
    color: var(--va-c-link);
    text-decoration: none;

    &:focus-visible {
      outline: 2px solid var(--yun-focus-color);
      outline-offset: 2px;
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
    }
  }

  code {
    display: inline-block;
    padding: 0.125rem 0.45rem;
    border: 1px solid var(--yun-surface-line);
    border-radius: 0.375rem;
    background-color: var(--va-c-bg-alt);
    color: var(--va-c-text);
    font-family: var(--va-font-mono);
    font-size: 0.8125rem;
    line-height: 1.4;
    vertical-align: baseline;
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;
    margin-inline: auto;
    border-radius: calc(var(--va-card-border-radius, 0.5rem) - 2px);
  }
}

.yun-ad-board-card.is-align-start .yun-ad-board-body {
  text-align: start;
}

.yun-ad-board-card.is-flush .yun-ad-board-body img {
  width: 100%;
  border-radius: 0;
}

.yun-ad-board-footer {
  width: 100%;
  margin-top: 0.625rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--yun-surface-line);
  color: var(--va-c-text-3);
  font-size: 0.75rem;
  line-height: 1.5;
  text-align: center;
}

.yun-ad-board-card.is-align-start .yun-ad-board-footer {
  text-align: start;
}

.yun-ad-board-card.is-flush .yun-ad-board-footer {
  margin-top: 0;
  padding: 0.625rem 1rem;
}
</style>
