<script setup lang="ts">
import { formatDate } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  date?: string | number | Date
  template?: string
  timezone?: string
  keepLocalTime?: boolean
}>()

const formattedDate = computed(() => {
  return formatDate(props.date, {
    template: props.template,
    timezone: props.timezone,
  })
})
</script>

<template>
  <div flex="~ gap-2 justify-between" p-2 my-2 border>
    <slot />

    <div flex="~ col gap-1" class="text-sm w-xs">
      <span class="flex justify-between gap-2">
        <span op="55" font-bold>DATE:</span>
        <span flex="~ gap-1 items-center">
          <span text-xs op-80>{{ timezone }}</span>
          <span>{{ date }}</span>
        </span>
      </span>
      <span class="flex justify-between gap-2">
        <span op="55" font-bold>
          FORMAT:
        </span>
        <span>
          {{ template }}
        </span>
      </span>
      <span class="flex justify-between gap-2">
        <span op="55" font-bold>
          KeepLocalTime:
        </span>
        <span>
          {{ keepLocalTime }}
        </span>
      </span>
    </div>

    <div>
      <span op="55" font="bold">
        Formatted:
      </span>
      <time>
        {{ formattedDate }}
      </time>
    </div>
  </div>
</template>
