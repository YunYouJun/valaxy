<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { useI18n } from 'vue-i18n'
import PressButton from './PressButton.vue'

const fm = useFrontmatter()

const { t } = useI18n()
</script>

<template>
  <div text="center" m="md:t-24 t-10 md:t-20" flex="~ col" justify="center" items="center">
    <ValaxyLogo mb="2" />
    <h1 my="10" text="4xl md:8xl" font="black" class="gradient-text from-purple-800 to-blue-500 bg-gradient-to-r">
      {{ fm.hero.name }}
    </h1>
  </div>

  <h2 flex="~ wrap justify-center" px="2" m="b-10" text="center 6xl" font="black" leading="tight">
    <span mx-1>{{ t('banner.next-generation') }}</span>
    <span mx-1>{{ t('banner.static') }} </span>
    <span mx-1 class="gradient-text from-blue-500 to-purple-700 bg-gradient-to-r">{{ t('banner.blog') }}</span>
    <span mx-1 class="break-keep">{{ t('banner.framework') }}</span>
  </h2>

  <div p="2" text="center" class="flex justify-center items-center">
    <template v-for="action in fm.hero.actions" :key="action.link">
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
