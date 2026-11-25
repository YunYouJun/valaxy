<script lang="ts" setup>
import type { ProjectDataType } from '../../types'
import { useFrontmatter, useValaxyI18n } from 'valaxy'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()
const { t } = useI18n()
const { $tO } = useValaxyI18n()
const projects = reactive(fm.value.projects as ProjectDataType)
const pageTitle = computed(() => $tO(fm.value.title) || t('title.projects'))

const curCategory = ref('all')
</script>

<template>
  <div class="yun-projects w-full max-w-6xl mx-auto px-4 sm:px-6 pb-8" flex="~ col items-center">
    <YunPageHeader
      :title="pageTitle"
      :icon="fm.icon"
      :color="fm.color"
      :page-title-class="fm.pageTitleClass"
    />

    <div
      class="yun-project-filters"
      role="group"
      :aria-label="pageTitle"
    >
      <YunProjectToggleButton
        :active="curCategory === 'all'"
        @click="curCategory = 'all'"
      >
        {{ t('theme.all') }}
      </YunProjectToggleButton>
      <YunProjectToggleButton
        v-for="(category, key) in projects"
        :key="key"
        :active="key === curCategory"
        @click="curCategory = key as string"
      >
        <span class="inline-flex" aria-hidden="true">{{ category.emoji }}</span>
        <span class="inline-flex">{{ category.title }}</span>
      </YunProjectToggleButton>
    </div>

    <div class="yun-project-collections w-full flex flex-col gap-10 mt-8">
      <template v-for="(category, key) in projects" :key="key">
        <YunProjectCollection
          v-if="curCategory === 'all' || curCategory === key"
          :title="category.title"
          :emoji="category.emoji"
          :projects="category.collection"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.yun-project-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
