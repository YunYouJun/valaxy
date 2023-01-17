<script lang="ts" setup>
import { useThemeConfig } from '../../composables/config'
const themeConfig = useThemeConfig()
</script>

<template>
  <div class="pr-nav-screen-appearance" flex="~ 1">
    <p class="text">
      {{ themeConfig.darkModeSwitchLabel || 'Appearance' }}
    </p>
    <PressSwitchAppearance />
  </div>
</template>

<style scoped>
.pr-nav-screen-appearance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  background-color: var(--va-c-bg-soft);
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--va-c-text-2);
}
</style>
