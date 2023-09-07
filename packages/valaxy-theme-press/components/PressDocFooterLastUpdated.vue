<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useData, useThemeConfig } from 'valaxy'
import type { PressTheme } from '../types'

const data = useData()
const themeConfig = useThemeConfig<PressTheme.Config>()

const date = computed(() => new Date(data.lastUpdated!))
const isoDatetime = computed(() => date.value.toISOString())
const datetime = ref('')

// set time on mounted hook because the locale string might be different
// based on end user and will lead to potential hydration mismatch if
// calculated at build time
onMounted(() => {
  watchEffect(() => {
    datetime.value = date.value.toLocaleString(window.navigator.language)
  })
})
</script>

<template>
  <p class="press-lastUpdated">
    {{ themeConfig.lastUpdatedText ?? 'Last updated' }}:
    <time :datetime="isoDatetime">{{ datetime }}</time>
  </p>
</template>

<style scoped>
.press-lastUpdated {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--va-c-text-light);
}

@media (min-width: 640px) {
  .press-lastUpdated {
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
