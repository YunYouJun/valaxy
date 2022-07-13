<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  theme: 'brand' | 'alt'
  link: string
  text: string
}>()

const router = useRouter()

const classes = computed(() => {
  const arr = []
  if (props.theme === 'brand')
    arr.push('from-blue-500', 'to-blue-700')
  else
    arr.push('from-gray-600', 'to-stone-700')

  return arr
})
</script>

<template>
  <button
    m="2"
    :class="classes"
    class="sese-btn btn" bg="gradient-to-r"
    @click="router.push(link)"
  >
    {{ text }}
  </button>
</template>
