<script lang="ts" setup>
import { usePagination } from 'valaxy'

const props = defineProps<{
  /**
   * Total Pages
   */
  total: number
  /**
   * Page Size
   */
  pageSize: number
}>()

const { curPage, totalPages, showPage, getTo, surLen, prevTo, nextTo, showPrev, showNext } = usePagination({
  total: props.total,
  pageSize: props.pageSize,
})

defineExpose({
  curPage,
})
</script>

<template>
  <ClientOnly>
    <nav class="pagination">
      <RouterLink v-if="showPrev" class="page-number" :to="prevTo" aria-label="prev">
        <div i-ri-arrow-left-s-line />
      </RouterLink>

      <template v-for="i in totalPages" :key="i">
        <RouterLink
          v-if="showPage(i)" class="page-number"
          :class="curPage === i && 'active'"
          :aria-current="curPage === i ? 'page' : undefined"
          :to="getTo(i)"
        >
          {{ i }}
        </RouterLink>
        <span v-else-if="i === curPage - surLen" class="space" disabled>
          ...
        </span>
        <span v-else-if="i === curPage + surLen" class="space" disabled>
          ...
        </span>
      </template>

      <RouterLink v-if="showNext" class="page-number" :to="nextTo" aria-label="next">
        <div i-ri-arrow-right-s-line />
      </RouterLink>
    </nav>
  </ClientOnly>
</template>

<style lang="scss" scoped>
@use '../styles/mixins/glass';

.pagination {
  @include glass.surface;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  width: fit-content;
  max-width: calc(100% - 1rem);
  margin: 1.25rem auto 0;
  padding: 0.25rem;
  border-radius: 1.25rem;

  .page-number,
  .space {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.125rem;
    min-height: 2.125rem;
    padding-inline: 0.5rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .page-number {
    color: var(--va-c-text);
    text-decoration: none;
    transition: background-color 180ms ease, color 180ms ease;

    &:focus-visible {
      outline: 2px solid var(--yun-focus-color);
      outline-offset: 1px;
    }

    &:is(:hover, :focus-visible) {
      background-color: color-mix(in srgb, var(--va-c-link) 12%, transparent);
      color: var(--va-c-link);
    }

    &.active {
      color: var(--va-c-bg);
      background: var(--va-c-link);
    }
  }

  .space {
    color: var(--va-c-text-2);
  }

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    @include glass.solid;
  }

  @media (prefers-reduced-motion: reduce) {
    .page-number {
      transition: none;
    }
  }
}
</style>
