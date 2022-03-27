<script lang="ts" setup>
import { useFrontmatter, useTag } from 'valaxy'
import { TinyColor } from '@ctrl/tinycolor'
import { useI18n } from 'vue-i18n'
import Base from './base.vue'

const frontmatter = useFrontmatter()

const tags = useTag()

const gray = new TinyColor('#999999')
const primaryColor = new TinyColor(getComputedStyle(document.documentElement).getPropertyValue('--yun-c-primary'))

const getTagStyle = (count: number) => {
  const counts = Array.from(tags).map(([_, value]) => value.count)
  const max = Math.max(...counts)
  const min = Math.min(...counts)
  const range = max - min
  const percent = (count - min) / range
  return {
    color: gray.mix(primaryColor, percent * 100).toString(),
    fontSize: `${percent * 36 + 12}px`,
  }
}

const { t } = useI18n()
</script>

<template>
  <Base>
    <template #content>
      <YunPageHeader :title="frontmatter.title || t('menu.tags')" :icon="frontmatter.icon" :color="frontmatter.color" />

      <div text="center">
        <span v-for="tag, i in Object.fromEntries(tags)" :key="i" :style="getTagStyle(tag.count)" m="1">
          #{{ i }}<span text="xs">[{{ tag.count }}]</span>
        </span>
      </div>

      <router-view />
    </template>
  </Base>
</template>
