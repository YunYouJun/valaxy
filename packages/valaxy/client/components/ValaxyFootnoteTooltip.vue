<script setup lang="ts">
import { Tooltip } from 'floating-vue'
// distance offset for sup
</script>

<template>
  <Tooltip class="inline-block" :distance="8">
    <slot />

    <template #popper>
      <slot name="popper" />
    </template>
  </Tooltip>
</template>
