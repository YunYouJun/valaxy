<script lang="ts" setup>
defineProps<{
  active?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="vt-hamburger"
    :class="{ 'is-active': active }"
    aria-label="mobile navigation"
    :aria-expanded="active"
  >
    <span class="vt-hamburger-container">
      <span class="vt-hamburger-top" />
      <span class="vt-hamburger-middle" />
      <span class="vt-hamburger-bottom" />
    </span>
  </button>
</template>
