<script lang="ts" setup>
import type { Hero } from '../types'
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from '../composables'
import PressButton from './PressButton.vue'

const fm = useFrontmatter()
const hero = computed(() => fm.value.hero as Hero | undefined)

const { currentLocale, currentLocaleKey, hasLocales } = useLocaleConfig()

/**
 * Prepend the current locale prefix to internal links.
 */
function resolveLocaleLink(link: string): string {
  if (!hasLocales.value || !link.startsWith('/') || currentLocaleKey.value === 'root')
    return link
  const prefix = currentLocale.value.link
  const base = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  return `${base}${link}`
}

const actions = computed(() => {
  return (hero.value?.actions || []).map(action => ({
    ...action,
    link: resolveLocaleLink(action.link),
  }))
})
</script>

<template>
  <template v-if="hero">
    <div text="center" m="md:t-24 t-10 md:t-20" flex="~ col" justify="center" items="center">
      <div v-if="hero.image" class="press-hero-image" mb="2">
        <div class="press-hero-image-bg" />
        <PressImage class="fly-animation h-50" :image="hero.image" />
      </div>
      <h1 my="10" text="4xl md:8xl" font="black" class="gradient-text from-purple-800 to-blue-500 bg-gradient-to-r">
        {{ hero.name }}
      </h1>
    </div>

    <h2 v-if="hero.text" flex="~ wrap justify-center" px="2" m="b-10" text="center 6xl" font="black" leading="tight">
      {{ hero.text }}
    </h2>

    <p v-if="hero.tagline" m="b-10" text="center xl" op="80">
      {{ hero.tagline }}
    </p>

    <div v-if="actions.length" p="2" text="center" class="flex justify-center items-center">
      <template v-for="action in actions" :key="action.link">
        <PressGetStarted
          v-if="action.type === 'fly'"
          :theme="action.theme"
          :link="action.link"
          :text="action.text"
        />
        <PressButton
          v-else
          :theme="action.theme"
          :link="action.link"
          :text="action.text"
        />
      </template>
    </div>

    <br>
  </template>
</template>

<style scoped>
.press-hero-image {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.press-hero-image-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  width: 150%;
  height: 150%;
  background-image: linear-gradient(-45deg, rgb(108 34 236) 50%, rgb(59 130 246) 50%);
  opacity: 0.3;
  transition: opacity var(--va-transition-duration-fast);
}

.press-hero-image:hover .press-hero-image-bg {
  opacity: 0.4;
}

.press-hero-image :deep(img) {
  position: relative;
  z-index: 1;
  margin: auto;
  width: auto;
  object-fit: contain;
}
</style>
