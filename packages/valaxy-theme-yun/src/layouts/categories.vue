<script lang="ts" setup>
import { useCategory, useFrontmatter } from 'valaxy'
import { useI18n } from 'vue-i18n'
import Base from './base.vue'

const { t } = useI18n()

const frontmatter = useFrontmatter()
const categories = useCategory()
</script>

<template>
  <Base>
    <template #content>
      <YunPageHeader
        :title="frontmatter.title || t('menu.categories')"
        :icon="frontmatter.icon || 'i-ri-folder-2-line'"
        :color="frontmatter.color"
      />
      <div text="center" class="yun-text-light" p="2">
        {{ t('counter.categories', Array.from(categories).length) }}
      </div>
      <YunCategories :categories="categories" />
      <router-view />
    </template>
  </Base>
</template>
