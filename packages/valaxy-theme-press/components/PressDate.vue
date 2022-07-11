<script lang="ts" setup>
import { formatDate } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  date?: Date | number | string
}>()

const datetime = computed(() => formatDate(props.date || ''))
</script>

<template>
  <dl>
    <dt class="sr-only">
      Published on
    </dt>
    <dd class="text-base leading-6 font-medium text-gray-500">
      <time :datetime="datetime">{{ datetime }}</time>
    </dd>
  </dl>
</template>
