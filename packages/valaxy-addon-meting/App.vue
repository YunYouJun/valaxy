<script lang="ts" setup>
import type { MetingProps } from './types'
import { useMeting, useVisible } from './client'
import { useMetingProps } from './client/useMetingProps'

const props = withDefaults(defineProps<{
  [key: string]: any
} & Partial<MetingProps>>(), {
  'id': '308168565',
  'server': 'netease',
  'type': 'playlist',
  // Omitted Boolean props must not override MetingJS/APlayer defaults.
  'fixed': undefined,
  'mini': undefined,
  'autoplay': undefined,
  'mutex': undefined,
  'list-folded': undefined,
})

useMeting()
const visible = useVisible()
const metingProps = useMetingProps(props, { fixed: true })
</script>

<template>
  <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
  <meting-js
    v-show="visible"
    v-bind="metingProps"
  />
</template>
