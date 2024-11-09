<script lang="ts" setup>
import { useCategories, useSiteStore, useTags } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const site = useSiteStore()

const categories = useCategories()
const tags = useTags()
</script>

<template>
  <nav class="site-nav" text-xl mt-2>
    <YunPostClassifyNavItem
      to="/archives/"
      icon="i-ri-archive-line"
      active-icon="i-ri-archive-fill"
      :title="t('menu.archives')"
      :total="site.postList.length"
    />
    <YunPostClassifyNavItem
      to="/categories/"
      icon="i-ri-folder-2-line"
      active-icon="i-ri-folder-2-fill"
      :title="t('menu.categories')"
      :total="Array.from(categories.children).length"
    />
    <YunPostClassifyNavItem
      to="/tags/"
      icon="i-ri-price-tag-3-line"
      active-icon="i-ri-price-tag-3-fill"
      :title="t('menu.tags')"
      :total="Array.from(tags).length"
    />
  </nav>
</template>

<style lang="scss">
@use "valaxy/client/styles/mixins/index.scss" as *;

.site-nav {
  display: flex;
  justify-content: center;
  overflow: hidden;
  line-height: 1.5;
  white-space: nowrap;
  text-align: center;
}
</style>
