<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { EXTERNAL_URL_RE } from 'valaxy'

const props = defineProps<{
  theme: 'brand' | 'alt'
  link: string
  text: string
}>()

const isUrl = computed(() => EXTERNAL_URL_RE.test(props.link))
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
  <component
    :is="isUrl ? 'a' : 'button'"
    m="2"
    :class="classes"
    class="sese-btn btn" bg="gradient-to-r"
    :href="isUrl ? link : undefined"
    :target="isUrl ? '_blank' : undefined"
    @click="!isUrl && router.push(link)"
  >
    {{ text }}
  </component>
</template>
