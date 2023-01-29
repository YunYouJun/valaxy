<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  theme: 'brand' | 'alt'
  link: string
  text: string
}>()

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
  <AppLink
    :to="link"
    m="2"
    :class="classes"
    class="sese-btn btn rounded-full hover:shadow-lg" bg="gradient-to-r"
    p="x-6"
  >
    {{ text }}
  </AppLink>
</template>
