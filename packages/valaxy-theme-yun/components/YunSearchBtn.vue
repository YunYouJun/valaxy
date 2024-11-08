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
    class="yun-search-btn popup-trigger size-12 inline-flex justify-center items-center"
    :class="!open && 'hover-bg-white/80 hover:bg-black/80'"
    text="xl $va-c-text"
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
  transition: background-color var(--va-transition-duration);
}
</style>
