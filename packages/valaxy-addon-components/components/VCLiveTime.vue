<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
  const start = new Date(props.startTime)
  const now = new Date()
  const timeDiff = (now.getTime() - start.getTime())
  const msPerMinute = 60 * 1000
  const msPerHour = 60 * msPerMinute
  const msPerDay = 24 * msPerHour
  passDay.value = Math.floor(timeDiff / msPerDay)
  passHour.value = Math.floor((timeDiff % msPerDay) / 60 / 60 / 1000)
  passMinute.value = Math.floor((timeDiff % msPerHour) / 60 / 1000)
  passSecond.value = Math.floor((timeDiff % msPerMinute) / 1000)
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
