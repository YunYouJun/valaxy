<script lang="ts" setup>
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

const props = defineProps<{
  theme: 'brand' | 'alt'
  link: string
  text: string
}>()

const classes = computed(() => {
  const arr = []
  if (props.theme === 'brand')
    arr.push('from-purple-700', 'to-indigo-600')
  else
    arr.push('from-gray-700', 'to-dark-300')

  return arr
})

const { t } = useI18n()
</script>

<template>
  <AppLink
    :to="link"
    m="2"
    :class="classes"
    class="sese-btn btn transition rounded-full hover:shadow-md"
    bg="gradient-to-r"
    p="x-6"
  >
    {{ t(text) }}
  </AppLink>
</template>
