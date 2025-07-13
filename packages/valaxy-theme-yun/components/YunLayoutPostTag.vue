<script lang="ts" setup>
import { useValaxyI18n } from 'valaxy'
import { ref } from 'vue'
import { useYunSpringAnimation } from '../composables/animation'

const props = defineProps<{
  i?: number
  title: string
  count: number
}>()

const { $t } = useValaxyI18n()

const tagRef = ref<HTMLElement>()
useYunSpringAnimation(tagRef, {
  i: props.i || 0,
  delay: 25,
})
</script>

<template>
  <span
    ref="tagRef"
    inline-flex my="2" p="1"
    class="post-tag cursor-pointer items-baseline leading-4"
  >
    <span inline-flex>#{{ $t(title) }}</span>
    <span inline-flex text="xs">[{{ count }}]</span>
  </span>
</template>
