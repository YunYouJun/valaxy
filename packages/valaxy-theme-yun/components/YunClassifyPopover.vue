<script setup lang="ts">
import { useMotion } from '@vueuse/motion'
import Popover from 'primevue/popover'
import { onMounted, ref } from 'vue'

const op = ref<typeof Popover>()

const pContentRef = ref<HTMLElement>()
const motion = useMotion(pContentRef, {
  initial: {
    opacity: 0,
    translateY: 30,
  },
  enter: {
    opacity: 1,
    translateY: 0,
    transition: {
      type: 'spring',
      duration: 200,
      damping: 9,
    },
  },
})

onMounted(() => {
  motion.variant.value = 'initial'

  // 滚动时隐藏
  window.addEventListener('scroll', () => {
    motion.variant.value = 'initial'
    setTimeout(() => {
      op.value?.hide()
    }, 200)
  })
})

function toggle(event: Event) {
  op.value?.toggle(event)
  motion.variant.value = op.value?.visible ? 'enter' : 'initial'
}
</script>

<template>
  <YunNavMenuItem
    icon="i-ri-mind-map" @click="toggle"
  />
  <Popover
    ref="op"
  >
    <div
      ref="pContentRef"
      class="p-4 shadow-xl"
      bg="$va-c-bg-light"
    >
      <YunSiteInfo class="text-center" />
      <YunPostsInfo />
    </div>
  </Popover>
</template>
