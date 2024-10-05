<script setup lang="ts">
import { type CSSProperties, computed, ref } from 'vue'
import { TinyColor } from '@ctrl/tinycolor'
import { useMotion } from '@vueuse/motion'
import type { ProjectItem } from '../../types'
import { cubicBezier } from '../../client/constants'

const props = defineProps<{
  i: number
  project: ProjectItem
}>()

const cardRef = ref<HTMLElement>()
useMotion(cardRef, {
  initial: {
    opacity: 0,
    y: 50,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      delay: props.i * 50,
      type: 'spring',
      ease: cubicBezier.easeIn,
      damping: 8,
      duration: 400,
    },
  },
})

const cardStyle = computed(() => {
  const styles: CSSProperties = {
    color: props.project.textColor,
  }
  if (props.project.color && (typeof props.project.gradient === 'undefined' || props.project.gradient)) {
    const color = new TinyColor(props.project.color)
    styles['--un-gradient-stops'] = `${color.spin(55).toHexString()}, ${props.project.color}`
    if (!styles.color)
      styles.color = color.isDark() ? 'white' : 'black'
  }
  else {
    styles.backgroundColor = props.project.color || 'rgba(255,255,255,0.9)'
    if (!styles.color)
      styles.color = 'black'
  }
  return styles
})

const githubUrl = computed(() => {
  if (props.project.github)
    return `https://github.com/${props.project.github}`
  else
    return `https://github.com/YunYouJun/${props.project.name}`
})

const npmLink = computed(() => {
  return props.project.npm ? `https://www.npmjs.com/package/${props.project.npm}` : ''
})

const projectUrl = computed(() => {
  return props.project.url || githubUrl.value
})

const links = computed(() => [
  {
    url: projectUrl.value,
    icon: 'i-ri-global-line',
    color: '#6eb7f9',
  },
  {
    url: props.project.docs,
    icon: 'i-ri-book-line',
    color: '#443ed1',
  },
  {
    url: githubUrl.value,
    icon: 'i-ri-github-line',
    color: 'black',
  },
  {
    url: npmLink.value,
    icon: 'i-ri-npmjs-line',
    color: 'red',
  },
])
</script>

<template>
  <div
    ref="cardRef"
    flex="~ col center"
    class="m-2 w-90 transform rounded shadow-md grayscale-30"
    bg="opacity-80 gradient-to-br"
    p="x-2 b-12"
    hover="shadow-lg grayscale-0"
    :style="cardStyle"
  >
    <div v-if="project.emoji" class="mt-4">
      {{ project.emoji }}
    </div>
    <a :href="projectUrl" target="_blank" class="text-unset">
      <h2 text="lg" font="bold" m="2">
        {{ project.name || '忘记叫啥了' }}
      </h2>
    </a>
    <small
      class="block" p="2" text="center"
      v-html="project.desc || '说点什么好呢'"
    />
    <div flex="~ center" class="absolute left-0 right-0 bottom-0 h-10">
      <template v-for="item in links" :key="item.icon">
        <YunProjectLinkItem
          v-if="item.url"
          :item="item"
        />
      </template>
    </div>
  </div>
</template>
