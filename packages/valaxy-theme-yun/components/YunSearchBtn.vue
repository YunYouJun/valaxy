<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: false,
})

const emit = defineEmits(['close', 'open'])

const { t } = useI18n()

function onClick() {
  if (props.open)
    emit('close')
  else
    emit('open')
}
</script>

<template>
  <button
    class="yun-search-btn yun-icon-btn yun-search-action popup-trigger"
    :title="t('menu.search')"
    @click="onClick"
  >
    <div v-if="!open" i-ri-search-line aria-hidden="true" />
    <div v-else i-ri-close-line aria-hidden="true" />
  </button>
</template>

<style lang="scss">
.yun-search-btn {
  z-index: var(--yun-z-search-btn);
  transition: background-color var(--va-transition-duration);
}
</style>
