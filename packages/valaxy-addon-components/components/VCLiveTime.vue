<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { differenceInSeconds } from 'date-fns'

const props = defineProps<{
  startTime: string
}>()

const { t } = useI18n()

const passDay = ref(0)
const passHour = ref(0)
const passMinute = ref(0)
const passSecond = ref(0)

/**
 * get live time
 */
function siteLiveTime() {
  const start = (props.startTime)
  const now = new Date()
  const timeDiff = differenceInSeconds(now, start)
  passDay.value = Math.floor(timeDiff / 60 / 60 / 24)
  passHour.value = Math.floor(timeDiff / 60 / 60 % 24)
  passMinute.value = Math.floor(timeDiff / 60 % 60)
  passSecond.value = Math.floor(timeDiff % 60)
}

onMounted(() => {
  setInterval(siteLiveTime, 1000)
})
</script>

<template>
  <div class="vc-site-live-time">
    <slot name="live-time-before" />
    <span mx-1>{{ t('time.day', passDay) }}</span>
    <span mx-1>{{ t('time.hour', passHour) }}</span>
    <span mx-1>{{ t('time.minute', passMinute) }}</span>
    <span mx-1>{{ t('time.second', passSecond) }}</span>
    <slot name="live-time-after" />
  </div>
</template>
