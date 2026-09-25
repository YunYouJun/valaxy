<script setup lang="ts">
import { useFrontmatter, useOutline } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYunAppStore } from '../../stores'

const props = withDefaults(defineProps<{
  floatingTrigger?: boolean
}>(), {
  floatingTrigger: true,
})

const fm = useFrontmatter()
const { headers } = useOutline()
const yun = useYunAppStore()
const { t } = useI18n()
const hasOutline = computed(() => fm.value.aside !== false
  && fm.value.toc !== false
  && fm.value.outline !== false
  && headers.value.length > 0)
const showFloatingTrigger = computed(() => props.floatingTrigger && hasOutline.value)
</script>

<template>
  <button
    v-if="showFloatingTrigger"
    type="button"
    class="xl:hidden toc-btn shadow-md fixed yun-icon-btn z-20 bg-$va-c-bg-soft"
    opacity="75" right="4" bottom="19"
    :aria-label="t('sidebar.toc')"
    :aria-expanded="yun.rightSidebar.isOpen"
    aria-controls="yun-page-outline"
    @click="yun.rightSidebar.toggle()"
  >
    <div i-ri-file-list-line />
  </button>

  <YunOverlay :show="yun.rightSidebar.isOpen" @click="yun.rightSidebar.toggle()" />
  <YunAside v-if="hasOutline" />
</template>
