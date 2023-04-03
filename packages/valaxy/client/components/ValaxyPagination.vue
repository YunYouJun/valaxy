<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  /**
   * Cur Page Number
   */
  curPage: number
  /**
   * Total Pages
   */
  total: number
  /**
   * Page Size
   */
  pageSize: number
}>()

const emit = defineEmits(['pageChange'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

/**
 * 围绕的长度
 */
const surLen = computed(() => {
  if (props.curPage === 1 || props.curPage === totalPages.value)
    return 3
  else
    return 2
})

function showPage(i: number) {
  if (i === 1)
    return true
  else if (i === totalPages.value)
    return true
  return i > props.curPage - surLen.value && i < props.curPage + surLen.value
}

function jumpTo(page: number) {
  emit('pageChange', page)
  if (page === 1)
    return '/'
  else return `/page/${page}`
}
</script>

<template>
  <nav class="pagination">
    <router-link v-if="curPage !== 1" class="page-number" :to="jumpTo(curPage - 1)" aria-label="prev">
      <div i-ri-arrow-left-s-line />
    </router-link>

    <template v-for="i in totalPages">
      <router-link v-if="showPage(i)" :key="i" class="page-number" :class="curPage === i && 'active'" :to="jumpTo(i)">
        {{ i }}
      </router-link>
      <span v-else-if="i === curPage - surLen" :key="`prev-space-${i}`" class="space" disabled>
        ...
      </span>
      <span v-else-if="i === curPage + surLen" :key="`next-space-${i}`" class="space" disabled>
        ...
      </span>
    </template>

    <router-link v-if="curPage !== totalPages" class="page-number" :to="jumpTo(curPage + 1)" aria-label="next">
      <div i-ri-arrow-right-s-line />
    </router-link>
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
