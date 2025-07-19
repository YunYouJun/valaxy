<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useYunAppStore } from '../../stores'

const yun = useYunAppStore()

const fm = useFrontmatter()
const showLeftLayout = computed(() => {
  if (typeof fm.value.sidebar !== 'undefined')
    return fm.value.sidebar
  return yun.size.isLg
})
</script>

<template>
  <div
    v-if="showLeftLayout"
    flex="~ col" class="gap-4 sticky top-$yun-margin-top w-80"
  >
    <slot>
      <YunSidebarCard />
      <YunAdBoard />
    </slot>
  </div>
</template>
