<script setup lang="ts">
import { useTemplateRef } from 'vue'
import Cover from '../../packages/create-valaxy/template-blog/components/covers/HelloValaxyCover.vue'

defineOptions({ inheritAttrs: false })
defineProps<{ exportLabel?: string }>()
const cover = useTemplateRef('cover')
</script>

<template>
  <Cover ref="cover" v-bind="$attrs" />
  <ValaxySvgExport :svg="cover?.svg" filename="hello-valaxy-og.png" :label="exportLabel" class="my-4" />
</template>
