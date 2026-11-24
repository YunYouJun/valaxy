<script setup lang="ts">
withDefaults(defineProps<{
  open?: boolean
  appear?: boolean
}>(), {
  open: false,
  appear: false,
})
</script>

<template>
  <svg
    class="yun-search-icon"
    :class="{ 'is-open': open, 'is-appear': appear }"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle
      class="yun-search-icon-lens"
      cx="10.5"
      cy="10.5"
      r="7.5"
      transform="rotate(45 10.5 10.5)"
    />
    <line
      class="yun-search-icon-handle"
      x1="19"
      y1="19"
      x2="5"
      y2="5"
    />
    <line
      class="yun-search-icon-cross"
      x1="19"
      y1="5"
      x2="5"
      y2="19"
    />
  </svg>
</template>

<style lang="scss">
.yun-search-icon {
  display: block;
  width: var(--yun-action-btn-icon-size, 1.25rem);
  height: var(--yun-action-btn-icon-size, 1.25rem);
  overflow: visible;
}

.yun-search-icon-lens {
  stroke-dasharray: 48 52;
  stroke-dashoffset: 0;
  opacity: 1;
  transition:
    stroke-dashoffset var(--va-transition-duration, 0.25s) cubic-bezier(0.22, 1, 0.36, 1) 0.05s,
    opacity 0.12s ease 0.04s;
}

.yun-search-icon-handle {
  stroke-dasharray: 20 24;
  stroke-dashoffset: 12.93;
  transform: translate(1.8px, 1.8px);
  transition:
    stroke-dashoffset var(--va-transition-duration, 0.25s) cubic-bezier(0.22, 1, 0.36, 1),
    transform var(--va-transition-duration, 0.25s) cubic-bezier(0.22, 1, 0.36, 1);
}

.yun-search-icon-cross {
  stroke-dasharray: 20 24;
  stroke-dashoffset: 21;
  opacity: 0;
  transition:
    stroke-dashoffset 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.12s ease 0.04s;
}

.yun-search-icon.is-open {
  .yun-search-icon-lens {
    stroke-dashoffset: 49;
    opacity: 0;
    transition:
      stroke-dashoffset var(--va-transition-duration, 0.25s) cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.14s ease 0.08s;
  }

  .yun-search-icon-handle {
    stroke-dashoffset: 0;
    transform: translate(0, 0);
  }

  .yun-search-icon-cross {
    stroke-dashoffset: 0;
    opacity: 1;
    transition:
      stroke-dashoffset 0.22s cubic-bezier(0.22, 1, 0.36, 1) 0.06s,
      opacity 0.12s ease 0.06s;
  }
}

.yun-search-icon.is-appear.is-open {
  @starting-style {
    .yun-search-icon-lens {
      stroke-dashoffset: 0;
      opacity: 1;
    }

    .yun-search-icon-handle {
      stroke-dashoffset: 12.93;
      transform: translate(1.8px, 1.8px);
    }

    .yun-search-icon-cross {
      stroke-dashoffset: 21;
      opacity: 0;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .yun-search-icon-lens,
  .yun-search-icon-handle,
  .yun-search-icon-cross,
  .yun-search-icon.is-open .yun-search-icon-lens,
  .yun-search-icon.is-open .yun-search-icon-handle,
  .yun-search-icon.is-open .yun-search-icon-cross {
    transition: none;
  }
}
</style>
