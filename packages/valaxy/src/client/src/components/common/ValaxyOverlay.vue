<script lang="ts" setup>
withDefaults(defineProps<{
  show: boolean
}>(), {
  show: false,
})
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="val-overlay" />
  </transition>
</template>
