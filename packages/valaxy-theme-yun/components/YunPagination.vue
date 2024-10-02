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
</script>

<template>
  <nav class="pagination">
    <RouterLink v-if="showPrev" class="page-number" :to="prevTo" aria-label="prev">
      <div i-ri-arrow-left-s-line />
    </RouterLink>

    <template v-for="i in totalPages">
      <RouterLink
        v-if="showPage(i)" :key="i" class="page-number"
        :class="curPage === i && 'active'"
        :to="getTo(i)"
      >
        {{ i }}
      </RouterLink>
      <span v-else-if="i === curPage - surLen" :key="`prev-space-${i}`" class="space" disabled>
        ...
      </span>
      <span v-else-if="i === curPage + surLen" :key="`next-space-${i}`" class="space" disabled>
        ...
      </span>
    </template>

    <RouterLink v-if="showNext" class="page-number" :to="nextTo" aria-label="next">
      <div i-ri-arrow-right-s-line />
    </RouterLink>
  </nav>
</template>

<style lang="scss">
:root {
  --page-btn-bg-color: rgba(255, 255, 255, 0.5);
  --page-btn-hover-bg-color: var(--va-c-primary-lighter);
  --page-btn-active-bg-color: var(--va-c-primary-light);
}

.dark {
  --page-btn-bg-color: var(--va-c-bg-light);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;

  .prev, .next, .page-number, .space {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 2rem;
    height: 2rem;
    margin: 0;
    transition: background-color var(--va-transition-duration) ease;

    // disabled attr
    &[disabled] {
      background-color: var(--va-c-bg-mute);
    }
  }

  .prev, .next, .page-number {
    cursor: pointer;
    color: var(--va-c-text);
    text-decoration: none;
    background-color: var(--page-btn-bg-color);

    &:hover {
      color: var(--va-c-bg);
      background: var(--page-btn-hover-bg-color);
    }

    &:active {
      color: var(--va-c-bg);
      background: var(--page-btn-active-bg-color);
    }

    &.active {
      font-weight: normal;
      background: var(--page-btn-active-bg-color);
      color: var(--va-c-bg);
      cursor: default;
    }

  }
}
</style>
