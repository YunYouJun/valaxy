<script lang="ts" setup>
import type { MetingProps } from '../types'
import { useMeting, useVisible } from '../client'
import { useMetingProps } from '../client/useMetingProps'

const props = withDefaults(defineProps<{
  [key: string]: any
} & Partial<MetingProps>>(), {
  id: '308168565',
  server: 'netease',
  type: 'playlist',
})

useMeting()
const visible = useVisible()
const metingProps = useMetingProps(props)
</script>

<template>
  <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
  <meting-js v-show="visible" v-bind="metingProps" />
</template>
