<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProjectDataType } from '../../types'

const fm = useFrontmatter()
const { t } = useI18n()
const projects = reactive(fm.value.projects as ProjectDataType)

const curCategory = ref('all')
</script>

<template>
  <div flex="~ col center">
    <h2 class="mb-3 text-2xl">
      {{ fm.title || t('title.projects') }}
    </h2>

    <div flex="~ wrap" justify="center">
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
