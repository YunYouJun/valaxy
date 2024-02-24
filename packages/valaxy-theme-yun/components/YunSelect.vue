<script setup lang='ts'>
import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'

defineProps<{
  options: string[]
}>()

const activeValue = defineModel()
const optionVisible = ref(false)

useEventListener('click', () => {
  optionVisible.value = false
})
</script>

<template>
  <div class="relative h-8 w-30 text-[var(--va-c-text-2)] z-100">
    <button
      class="flex h-full w-full px-2 items-center justify-between border rounded-2 transition"
      :class="optionVisible ? 'border-[var(--va-c-primary)] shadow-lg' : ''"
      @click.stop="optionVisible = true"
    >
      <span>{{ activeValue }}</span>
      <div inline-flex i-ri-arrow-down-s-line />
    </button>
    <Transition>
      <ul
        v-show="optionVisible"
        class="select-options absolute translate-y-1 left-0 top-full w-full bg-[var(--va-c-bg-light)] overflow-hidden rounded-1 border"
      >
        <li
          v-for="option in options"
          :key="option"
          class="cursor-pointer list-none px-2 hover:bg-[var(--va-c-primary-lighter)] hover:text-white"
          @click="activeValue = option"
        >
          {{ option }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.select-options {
  margin: 0;
}

.v-enter-active,
.v-leave-active {
  transition: opacity .3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
