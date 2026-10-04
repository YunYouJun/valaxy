<script setup lang="ts">
import { Tooltip } from 'floating-vue'
import { onMounted, ref } from 'vue'

// floating-vue Tooltip generates different DOM during SSR vs client hydration.
// Only mount the Tooltip after the component is mounted on the client to avoid mismatches.
// During SSR and initial client render, a plain <span> is shown instead.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <Tooltip v-if="mounted" class="inline-block" :distance="8">
    <slot />

    <template #popper>
      <slot name="popper" />
    </template>
  </Tooltip>
  <span v-else class="inline-block">
    <slot />
  </span>
</template>
