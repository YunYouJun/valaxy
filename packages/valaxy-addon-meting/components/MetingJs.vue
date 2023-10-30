<script lang="ts" setup>
import { useMeting } from '../client'

const props = withDefaults(defineProps<{
  [key: string]: any
} & Partial<MetingJsProps>>(), {
  id: '308168565',
  server: 'netease',
  type: 'playlist',
})

export interface MetingJsProps {
  /**
   * song id / playlist id / album id / search keyword
   * @example 308168565
   */
  id: string
  /**
   * music platform
   */
  server: 'netease' | 'tencent' | 'kugou' | 'xiami' | 'baidu'
  type: 'song' | 'playlist' | 'album' | 'search' | 'artist'
}

useMeting()
</script>

<template>
  <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
  <meting-js v-bind="props" />
</template>
