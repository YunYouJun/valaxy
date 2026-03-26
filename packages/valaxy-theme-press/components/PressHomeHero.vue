<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from '../composables'
import PressButton from './PressButton.vue'

const fm = useFrontmatter()

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
  return (fm.value.hero?.actions || []).map((action: any) => ({
    ...action,
    link: resolveLocaleLink(action.link),
  }))
})
</script>

<template>
  <template v-if="fm.hero">
    <div text="center" m="md:t-24 t-10 md:t-20" flex="~ col" justify="center" items="center">
      <ValaxyLogo mb="2" />
      <h1 my="10" text="4xl md:8xl" font="black" class="gradient-text from-purple-800 to-blue-500 bg-gradient-to-r">
        {{ fm.hero.name }}
      </h1>
    </div>

    <h2 v-if="fm.hero?.text" flex="~ wrap justify-center" px="2" m="b-10" text="center 6xl" font="black" leading="tight">
      {{ fm.hero.text }}
    </h2>

    <p v-if="fm.hero?.tagline" m="b-10" text="center xl" op="80">
      {{ fm.hero.tagline }}
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
