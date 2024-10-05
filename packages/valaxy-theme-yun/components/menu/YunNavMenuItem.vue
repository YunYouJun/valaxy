<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  icon: string
  to?: string
}>()

const router = useRouter()
</script>

<template>
  <div
    class="size-12 inline-flex-center cursor-pointer z-$yun-z-nav-menu"
    text="$va-c-text"
    hover="bg-white/80 dark:bg-black/80 op-100"
    op-80
    @click="to && router.push(to)"
  >
    <div class="size-6" :class="icon" />
  </div>
</template>
