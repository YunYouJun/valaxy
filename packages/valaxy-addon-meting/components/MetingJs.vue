<script lang="ts" setup>
import type { MetingProps } from '../types'
import { ref } from 'vue'
import { useMeting, useVisible } from '../client'
import { useMetingProps } from '../client/useMetingProps'

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

const meting = ref<HTMLElement>()
useMeting(meting)
const visible = useVisible(true)
const metingProps = useMetingProps(props)
</script>

<template>
  <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
  <meting-js v-show="visible" ref="meting" v-bind="metingProps" />
</template>
