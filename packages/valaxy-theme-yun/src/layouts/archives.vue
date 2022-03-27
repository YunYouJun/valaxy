<script lang="ts" setup>
import { useFrontmatter, usePostList } from 'valaxy'
import { useI18n } from 'vue-i18n'
import Base from './base.vue'

const { t } = useI18n()

const frontmatter = useFrontmatter()
const postList = usePostList()
</script>

<template>
  <Base>
    <template #content>
      <YunPageHeader :title="frontmatter.title || t('menu.archives')" :icon="frontmatter.icon || 'i-ri-archive-line'" :color="frontmatter.color" />
      <div text="center" class="yun-text-light" p="2">
        {{ t('counter.archives', postList.length) }}
      </div>

      <router-view />

      <YunPostCollapse :posts="postList" />
    </template>
  </Base>
</template>
