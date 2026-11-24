<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import YunSearchIcon from './ui/YunSearchIcon.vue'

const props = withDefaults(defineProps<{
  open?: boolean
  expandable?: boolean
}>(), {
  open: false,
  expandable: true,
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
    type="button"
    class="yun-search-btn yun-action-btn popup-trigger"
    :class="{ 'is-open': open }"
    :title="open ? t('theme.closeSearch') : t('menu.search')"
    :aria-label="open ? t('theme.closeSearch') : t('menu.search')"
    :aria-expanded="expandable ? open : undefined"
    @click="onClick"
  >
    <YunSearchIcon :open="open" />
  </button>
</template>

<style lang="scss">
.yun-search-btn {
  z-index: var(--yun-z-search-btn);
}
</style>
