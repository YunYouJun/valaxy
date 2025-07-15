<script lang="ts" setup>
import type { ProjectDataType } from '../../types'
import { useFrontmatter } from 'valaxy'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()
const { t } = useI18n()
const projects = reactive(fm.value.projects as ProjectDataType)

const curCategory = ref('all')
</script>

<template>
  <div flex="~ col center">
    <YunPageHeader
      :title="fm.title || t('title.projects')"
      :icon="fm.icon"
      :page-title-class="fm.pageTitleClass"
    />

    <div class="mt-3" flex="~ wrap" justify="center">
      <YunProjectToggleButton
        :active="curCategory === 'all'"
        @click="curCategory = 'all'"
      >
        全部
      </YunProjectToggleButton>
      <YunProjectToggleButton
        v-for="(category, key) in projects"
        :key="key"
        :active="key === curCategory"
        @click="curCategory = key as string"
      >
        <span class="inline-flex">{{ category.emoji }}</span>
        <span class="inline-flex">{{ category.title }}</span>
      </YunProjectToggleButton>
    </div>

    <div flex="~ wrap" justify="center">
      <template v-for="(category, key) in projects" :key="key">
        <YunProjectCollection
          v-if="curCategory === 'all' || curCategory === key"
          :title="category.title"
          :projects="projects[key].collection"
        />
      </template>
    </div>
  </div>
</template>
