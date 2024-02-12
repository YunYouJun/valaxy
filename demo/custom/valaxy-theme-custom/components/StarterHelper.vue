<script lang="ts" setup>
import { isClient, useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'

const { y } = useWindowScroll()
const showBackToTop = computed(() => y.value > 50)

function backToTop() {
  if (!isClient)
    return
  window.scrollTo({ top: 0 })
}
</script>

<template>
  <div class="fixed right-8 bottom-8 hidden flex-col gap-3 md:flex">
    <Transition>
      <button
        v-if="showBackToTop" class="rounded-full bg-gray-200 p-2 text-gray-500 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
        @click="backToTop"
      >
        <div i-ri-arrow-up-line />
      </button>
    </Transition>
  </div>
</template>
