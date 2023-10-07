<script lang="ts" setup>
import { useOutline, useSidebar } from 'valaxy'

import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  (e: 'openMenu'): void
}>()

const { hasSidebar } = useSidebar()

const { t } = useI18n()

const navHeight = ref(0)
onMounted(() => {
  navHeight.value = Number.parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--pr-nav-height',
    ),
  )
})

const { headers } = useOutline()
</script>

<template>
  <div v-if="hasSidebar" class="press-local-nav">
    <button
      class="menu"
      :aria-expanded="open"
      aria-controls="pr-sidebar-nav"
      @click="$emit('openMenu')"
    >
      <div i-ri-align-left class="menu-icon" />
      <span class="menu-text">
        {{ t('menu.title') }}
      </span>
    </button>

    <PressLocalNavOutlineDropdown :headers="headers" :nav-height="navHeight" />
  </div>
</template>

<style scoped lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.press-local-nav {
  position: sticky;
  top: 0;
  left: 0;
  z-index: var(--pr-z-local-nav);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--pr-c-divider-light);
  width: 100%;
  background-color: var(--va-c-bg);
  transition: border-color 0.5s;
}

@include screen('md') {
  .press-local-nav {
    display: none;
  }
}

.menu {
  display: flex;
  align-items: center;
  padding: 12px 24px 11px;
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--va-c-text-light);
  transition: color 0.5s;
}

.menu:hover {
  color: var(--va-c-text);
  transition: color 0.25s;
}

@include screen('md') {
  .menu {
    padding: 0 32px;
  }
}

.menu-icon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  fill: currentcolor;
}

.top-link {
  display: block;
  padding: 12px 24px 11px;
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--pr-c-text-2);
  transition: color 0.5s;
}

.top-link:hover {
  color: var(--pr-c-text-1);
  transition: color 0.25s;
}

@include screen('md') {
  .top-link {
    padding: 12px 32px 11px;
  }
}
</style>
