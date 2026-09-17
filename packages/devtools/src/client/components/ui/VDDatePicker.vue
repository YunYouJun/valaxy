<script setup lang="ts">
import type { DateValue } from 'reka-ui/date'
import dayjs from 'dayjs'
import {
  DatePickerCalendar,
  DatePickerCell,
  DatePickerCellTrigger,
  DatePickerGrid,
  DatePickerGridBody,
  DatePickerGridHead,
  DatePickerGridRow,
  DatePickerHeadCell,
  DatePickerHeader,
  DatePickerHeading,
  DatePickerNext,
  DatePickerPrev,
  DatePickerRoot,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  modelValue?: Date
  showTime?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date): void
}>()

// Display formatted value
const displayValue = computed(() => {
  if (!props.modelValue)
    return ''
  const fmt = props.showTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'
  return dayjs(props.modelValue).format(fmt)
})

function onDateChange(val: DateValue | undefined) {
  if (!val)
    return
  // Preserve time from the original modelValue if showTime
  const original = props.modelValue ? dayjs(props.modelValue) : dayjs()
  const newDate = dayjs()
    .year(val.year)
    .month(val.month - 1)
    .date(val.day)
    .hour(original.hour())
    .minute(original.minute())
    .second(original.second())
  emit('update:modelValue', newDate.toDate())
}
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger
      v-bind="$attrs"
      class="inline-flex items-center gap-1.5 border border-base bg-base rounded-md text-xs px-2 py-1 cursor-pointer hover:border-base transition-colors"
    >
      <div class="i-ri:calendar-line text-sm op-50" />
      <span class="color-base">{{ displayValue || 'Select date' }}</span>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="z-dropdown bg-base border border-base rounded-lg shadow-lg p-3"
        :side-offset="4"
      >
        <DatePickerRoot
          @update:model-value="onDateChange"
        >
          <DatePickerCalendar v-slot="{ grid, weekDays }">
            <DatePickerHeader class="flex items-center justify-between mb-2">
              <DatePickerPrev
                class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-hover cursor-pointer"
              >
                <div class="i-ri:arrow-left-s-line" />
              </DatePickerPrev>
              <DatePickerHeading class="text-sm font-medium color-base" />
              <DatePickerNext
                class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-hover cursor-pointer"
              >
                <div class="i-ri:arrow-right-s-line" />
              </DatePickerNext>
            </DatePickerHeader>

            <DatePickerGrid class="w-full">
              <DatePickerGridHead>
                <DatePickerGridRow class="flex">
                  <DatePickerHeadCell
                    v-for="day in weekDays"
                    :key="day"
                    class="w-8 h-8 text-xs color-faint flex items-center justify-center"
                  >
                    {{ day }}
                  </DatePickerHeadCell>
                </DatePickerGridRow>
              </DatePickerGridHead>
              <DatePickerGridBody>
                <DatePickerGridRow
                  v-for="(weekDates, index) in grid[0].rows"
                  :key="`weekDate-${index}`"
                  class="flex"
                >
                  <DatePickerCell
                    v-for="weekDate in weekDates"
                    :key="weekDate.toString()"
                    :date="weekDate"
                  >
                    <DatePickerCellTrigger
                      :day="weekDate"
                      :month="grid[0].value"
                      class="w-8 h-8 text-xs rounded flex items-center justify-center cursor-pointer hover:bg-hover data-[selected]:bg-primary-500 data-[selected]:text-white transition-colors"
                    >
                      {{ weekDate.day }}
                    </DatePickerCellTrigger>
                  </DatePickerCell>
                </DatePickerGridRow>
              </DatePickerGridBody>
            </DatePickerGrid>
          </DatePickerCalendar>
        </DatePickerRoot>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
