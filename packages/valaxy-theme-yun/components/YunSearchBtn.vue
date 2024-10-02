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
    class="yun-search-btn popup-trigger h-full inline-flex justify-center items-center aspect-1 bg-$va-c-bg"
    text="xl $va-c-text"
    hover="bg-$va-c-bg-soft"
    :title="t('menu.search')"
    @click="onClick"
  >
    <div v-if="!open" i-ri-search-line op-80 hover="op-100" />
    <div v-else text="!2xl" i-ri-close-line />
  </button>
</template>

<style lang="scss">
.yun-search-btn {
  z-index: var(--yun-z-search-btn);
}
</style>
