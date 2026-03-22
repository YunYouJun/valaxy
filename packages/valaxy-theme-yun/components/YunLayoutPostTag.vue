<script lang="ts" setup>
import { useValaxyI18n } from 'valaxy'
import { yunSpringVariants } from '../composables/animation'

const props = defineProps<{
  i?: number
  title: string
  count: number
}>()

const { $tTag } = useValaxyI18n()

const motionVariants = yunSpringVariants({ i: props.i || 0, delay: 25 })
</script>

<template>
  <span
    v-motion="motionVariants"
    inline-flex my="2" p="1"
    class="post-tag cursor-pointer items-baseline leading-4"
  >
    <span inline-flex>#{{ $tTag(title) }}</span>
    <span inline-flex text="xs">[{{ count }}]</span>
  </span>
</template>
