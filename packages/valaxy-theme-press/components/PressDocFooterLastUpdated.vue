<script setup lang="ts">
import { useData } from 'valaxy'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { page } = useData()

const date = computed(() => new Date(page.value?.lastUpdated || 0))
const isoDatetime = computed(() => date.value?.toISOString())
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
  <p class="press-lastUpdated text-right">
    {{ t('tooltip.last_updated') }}:
    <time :datetime="isoDatetime">{{ datetime }}</time>
  </p>
</template>

<style scoped>
/* stylelint-disable selector-class-pattern */
.press-lastUpdated {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--va-c-text-light);
}

@media (width >= 640px) {
  .press-lastUpdated {
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
