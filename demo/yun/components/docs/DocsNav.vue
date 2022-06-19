<script lang="ts" setup>
import { useCategory, usePageList } from 'valaxy'

const pages = usePageList()
const categories = useCategory('Docs', pages.value)
</script>

<template>
  <div text="left" m="2">
    <YunCategories :categories="categories.children" :collapsable="false" />
  </div>
</template>
