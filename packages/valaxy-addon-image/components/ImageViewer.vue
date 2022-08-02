<script lang="ts" setup>
import { useOverlayMeta } from 'unoverlay-vue'
import { ElImageViewer, imageViewerProps } from 'element-plus/es/components/image-viewer/index'
import 'element-plus/es/components/image-viewer/style/index'
const props = defineProps(imageViewerProps)

const { visible, confirm } = useOverlayMeta()
</script>

<template>
  <div class="ImageViewer fixed inset-0 z-2000">
    <ElImageViewer v-if="visible" v-bind="props" @close="confirm()" />
  </div>
</template>
