<script setup lang="ts">
import { formatDate } from 'valaxy'
import type { FormatOptionsWithTZ } from 'date-fns-tz'

defineProps<{ date?: string | number | Date, format?: string, timezone?: string, options?: FormatOptionsWithTZ }>()
</script>

<template>
  <div flex="~">
    <time mr-4>
      {{ formatDate(date ?? new Date(), format, timezone, options) }}
    </time>

    <code>
      {{ format }}
    </code>
  </div>
</template>
