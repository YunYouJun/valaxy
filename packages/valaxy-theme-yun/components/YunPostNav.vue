<script lang="ts" setup>
import { useLocaleTitle, usePrevNext } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const [prev, next] = usePrevNext()

const prevTitle = useLocaleTitle(prev)
const nextTitle = useLocaleTitle(next)
</script>

<template>
  <nav v-if="prev || next" class="post-nav" :aria-label="t('theme.postNav')">
    <div class="post-nav-item">
      <RouterLink v-if="prev" class="post-nav-link post-nav-prev" :to="prev.path || ''" :title="prevTitle">
        <span class="icon i-ri-arrow-left-s-line" aria-hidden="true" />
        <span class="title">{{ prevTitle }}</span>
      </RouterLink>
    </div>
    <div class="post-nav-item">
      <RouterLink v-if="next" class="post-nav-link post-nav-next" :to="next.path || ''" :title="nextTitle">
        <span class="title">{{ nextTitle }}</span>
        <span class="icon i-ri-arrow-right-s-line" aria-hidden="true" />
      </RouterLink>
    </div>
  </nav>
  <div v-else class="mt-4" aria-hidden="true" />
</template>

<style lang="scss">
.post-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;

  @media (width < 768px) {
    padding-inline: 0.75rem;
  }

  @media (width <= 640px) {
    grid-template-columns: 1fr;
  }
}

.post-nav-item {
  display: flex;
  min-width: 0;

  @media (width <= 640px) {
    &:empty {
      display: none;
    }
  }
}

.post-nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-width: 0;
  min-height: 3.25rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: var(--va-card-border-radius, 0.5rem);
  background-color: var(--va-c-bg-light);
  color: var(--va-c-text);
  font-family: var(--va-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 200ms var(--yun-ease-in-out),
    border-color 200ms ease,
    box-shadow 200ms ease,
    color 180ms ease;

  .icon {
    flex-shrink: 0;
    width: 1.2rem;
    height: 1.2rem;
    color: var(--va-c-text-2);
    transition: transform 180ms ease, color 180ms ease;
  }

  .title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    .icon {
      transition: none;
    }
  }
}

.post-nav-next {
  justify-content: flex-end;
  text-align: right;
}

@media (hover: hover) and (pointer: fine) {
  .post-nav-link:hover {
    border-color: color-mix(in srgb, var(--va-c-link) 32%, var(--yun-surface-line));
    color: var(--va-c-link);
    box-shadow: var(--yun-card-hover-shadow);

    @media (prefers-reduced-motion: no-preference) {
      transform: translateY(-1px);
    }

    .icon {
      color: var(--va-c-link);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .post-nav-prev:hover .icon {
      transform: translateX(-2px);
    }

    .post-nav-next:hover .icon {
      transform: translateX(2px);
    }
  }
}
</style>
