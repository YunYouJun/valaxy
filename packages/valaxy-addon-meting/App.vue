<script lang="ts" setup>
import { useAplayer } from 'valaxy'
import { computed } from 'vue'
const props = defineProps<{
  [key: string]: any
}>()

const loadAplayer = computed(() => props.auto || props.url || (props.id && props.server && props.type))

if (loadAplayer.value)
  useAplayer()
</script>

<template>
  <meting-js
    v-if="loadAplayer"
    v-bind="props"
    :fixed="true"
  />
</template>

<style lang="scss" scoped></style>
