<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

defineProps<{
  open: boolean
}>()

const emit = defineEmits(['toggle'])
const { t } = useI18n()
</script>

<template>
  <button
    class="press-search-btn"
    :class="{ 'press-search-btn--active': open }"
    :title="t('menu.search')"
    @click="emit('toggle')"
  >
    <div class="press-search-btn-content">
      <svg
        v-if="!open"
        class="press-search-btn-icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" fill="currentColor" />
      </svg>
      <svg
        v-else
        class="press-search-btn-icon press-search-btn-icon--close"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6.28 5.72a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.72z" fill="currentColor" />
      </svg>
    </div>
  </button>
</template>

<style lang="scss" scoped>
.press-search-btn {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 2.75rem;
  height: 2.75rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;

  &:hover {
    color: var(--vp-c-text-1);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--vp-c-brand);
    outline-offset: 2px;
  }

  &--active {
    color: var(--vp-c-brand);
  }
}

.press-search-btn-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.press-search-btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.8;

  .press-search-btn:hover & {
    opacity: 1;
  }

  &--close {
    transform: rotate(0deg);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    .press-search-btn:hover & {
      transform: rotate(90deg);
    }
  }
}

@media (width <= 768px) {
  .press-search-btn {
    width: 2.5rem;
    height: 2.5rem;
  }

  .press-search-btn-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}
</style>
