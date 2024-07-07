<script lang="ts" setup>
import { useAppStore } from 'valaxy'

const appStore = useAppStore()
</script>

<template>
  <button class="switch switch-appearance" type="button" aria-label="Toggle Dark Mode" @click="appStore.toggleDarkWithTransition">
    <span class="check">
      <span class="icon-wrap">
        <div v-if="!appStore.isDark" class="icon" i-ri-sun-line />
        <div v-else class="icon" i-ri-moon-line />
      </span>
    </span>
  </button>
</template>

<style lang="scss" scoped>
.switch {
  position: relative;
  display: block;
  box-sizing: border-box;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: 1px solid var(--pr-switch-divider);
  background-color: var(--pr-switch-bg);
  transition: border-color 0.25s, background-color 0.25s;
}

.switch:hover {
  border-color: #8e8e8e;
}

.check {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: background-color 0.25s, transform 0.25s;
}

.dark .check {
  background-color: #1a1a1a;
}

.icon-wrap {
  box-sizing: border-box;
  display: block;
  padding: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.icon {
  width: 12px;
  height: 12px;
  background-color: rgba(60, 60, 60, 0.7);
}

.dark .icon {
  background-color: rgba(255, 255, 255, 0.87);
}

.dark .switch-appearance :deep(.check) {
  transform: translateX(18px);
}
</style>
