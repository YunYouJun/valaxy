<script setup lang="ts">
import { useSidebar } from 'valaxy'
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()
const { hasSidebar } = useSidebar()
</script>

<template>
  <footer v-if="themeConfig.footer" class="press-footer" :class="{ 'has-sidebar': hasSidebar }">
    <div class="container">
      <p v-if="themeConfig.footer.message" class="message" v-html="themeConfig.footer.message" />
      <p v-if="themeConfig.footer.copyright" class="copyright" v-html="themeConfig.footer.copyright" />
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.press-footer {
  position: relative;
  z-index: var(--pr-z-index-footer);
  border-top: 1px solid var(--pr-c-divider-light);
  padding: 32px 24px;
  background-color: var(--va-c-bg);

  &.has-sidebar {
    display: none;
  }
}

@media (min-width: 768px) {
  .VPFooter {
    padding: 32px;
  }
}

.container {
  margin: 0 auto;
  max-width: var(--pr-layout-max-width);
  text-align: center;
}

.message,
.copyright {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--va-c-text-lighter);
}

.message   { order: 2; }
.copyright { order: 1; }
</style>
