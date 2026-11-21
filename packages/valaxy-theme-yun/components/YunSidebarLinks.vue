<script lang="ts" setup>
import { useValaxyI18n } from 'valaxy'
import { useThemeConfig } from '../composables'
import { useYunAppStore } from '../stores'

const themeConfig = useThemeConfig()
const { $t } = useValaxyI18n()
const yunApp = useYunAppStore()
</script>

<template>
  <div class="yun-sidebar-links links flex-center flex-wrap gap-1">
    <AppLink
      v-for="item, i in themeConfig.pages"
      :key="i"
      class="yun-sidebar-link link-item yun-action-btn"
      :class="{ 'has-accent': Boolean(item.iconColor || item.color) }"
      :to="item.url"
      :title="$t(item.name)"
      :aria-label="$t(item.name)"
      :style="item.iconColor || item.color ? { '--yun-sidebar-link-accent': item.iconColor || item.color } : undefined"
      @click="yunApp.fullscreenMenu.isOpen = false"
    >
      <div :class="item.icon" class="icon" aria-hidden="true" />
    </AppLink>
  </div>
</template>

<style lang="scss" scoped>
.yun-sidebar-link.yun-action-btn.has-accent {
  color: color-mix(in srgb, var(--yun-sidebar-link-accent) 62%, var(--yun-social-soft-base));
}

@media (hover: hover) and (pointer: fine) {
  .yun-sidebar-link.yun-action-btn:hover {
    color: var(--yun-sidebar-link-accent, var(--va-c-link));
  }
}

.yun-sidebar-link.yun-action-btn:active {
  color: var(--yun-sidebar-link-accent, var(--va-c-link));
}

.yun-sidebar-link.yun-action-btn:is([aria-current='page'], .router-link-exact-active) {
  color: var(--yun-sidebar-link-accent, var(--va-c-link));
  background-color: color-mix(in srgb, var(--yun-sidebar-link-accent, var(--va-c-link)) 11%, transparent);
}

:global(html.dark) .yun-sidebar-link.yun-action-btn.has-accent:is(:hover, :active, [aria-current='page'], .router-link-exact-active) .icon {
  filter: brightness(1.16);
}
</style>
