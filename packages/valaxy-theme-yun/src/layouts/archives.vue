<script lang="ts" setup>
import { useFrontmatter, usePostList } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const frontmatter = useFrontmatter()
const postList = usePostList()
</script>

<template>
  <YunBase>
    <template #content>
      <YunPageHeader :title="frontmatter.title || t('menu.archives')" :icon="frontmatter.icon || 'i-ri-archive-line'" :color="frontmatter.color" />

      <router-view />

      <YunPostCollapse :posts="postList" />
    </template>
  </YunBase>
</template>
