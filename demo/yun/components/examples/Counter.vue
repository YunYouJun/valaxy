<script setup lang="ts">
import { useCounter } from '@vueuse/core'

const props = defineProps<{
  initial?: number
}>()

const { count, inc, dec } = useCounter(props.initial || 0)
</script>

<template>
  <div class="counter-container">
    <span class="w-20">{{ count }}</span>
    <button class="inc w-20" @click="inc()">
      +
    </button>
    <button class="dec w-20" @click="dec()">
      -
    </button>
  </div>
</template>

<style lang="scss" scoped>
.counter-container {
  font-size: 2rem;
  border: 1px solid #ccc;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
}

button {
  margin: 0 0.5rem;
}
</style>
