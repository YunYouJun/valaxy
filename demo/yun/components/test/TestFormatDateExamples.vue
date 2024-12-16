<script setup lang="ts">
import dayjs from 'dayjs'
import { onBeforeMount } from 'vue'
import { dateExamples } from '../../../../e2e/utils/date-examples'

onBeforeMount(() => {})
</script>

<template>
  <div>
    Guess TimeZone: {{ dayjs.tz.guess() }}
  </div>
  <TestFormatDate
    v-for="(example, i) in dateExamples"
    :key="i"
    class="test-format-date"
    :class="`item-${i}`"
    v-bind="example"
  >
    <div class="inline-flex items-center justify-center p-2">
      {{ i + 1 }}
    </div>
  </TestFormatDate>
</template>
