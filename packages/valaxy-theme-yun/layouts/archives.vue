<script lang="ts" setup>
import { useFrontmatter, usePostList, usePostTitle } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const frontmatter = useFrontmatter()
const postList = usePostList()

const title = usePostTitle(frontmatter)
</script>

<template>
  <Base>
    <template #main-header>
      <YunPageHeader :title="title || t('menu.archives')" :icon="frontmatter.icon || 'i-ri-archive-line'" :color="frontmatter.color" />
    </template>
    <template #main-content>
      <router-view />
      <YunPostCollapse :posts="postList" />
    </template>
  </Base>
</template>
