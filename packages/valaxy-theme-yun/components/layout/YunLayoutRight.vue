<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { useYunAppStore } from '../../stores'

const fm = useFrontmatter()
const yun = useYunAppStore()
</script>

<template>
  <button
    v-if="fm.aside !== false"
    class="xl:hidden toc-btn shadow-md fixed yun-icon-btn z-20 bg-$va-c-bg-soft"
    opacity="75" right="4" bottom="19"
    @click="yun.rightSidebar.toggle()"
  >
    <div i-ri-file-list-line />
  </button>

  <YunOverlay :show="yun.rightSidebar.isOpen" @click="yun.rightSidebar.toggle()" />
  <YunAside v-if="fm.aside !== false" />
</template>
