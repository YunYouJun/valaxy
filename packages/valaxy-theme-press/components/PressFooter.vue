<script setup lang="ts">
import { useSidebar } from 'valaxy'
import { useLocaleConfig } from '../composables'

const { localeConfig } = useLocaleConfig()
const { hasSidebar } = useSidebar()
</script>

<template>
  <footer v-if="localeConfig.footer" class="press-footer" :class="{ 'has-sidebar': hasSidebar }">
    <div flex="~ col" class="container">
      <p v-if="localeConfig.footer.message" class="message" v-html="localeConfig.footer.message" />
      <p v-if="localeConfig.footer.copyright" class="copyright" v-html="localeConfig.footer.copyright" />
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.press-footer {
  position: relative;
  z-index: var(--pr-z-footer);
  border-top: 1px solid var(--pr-c-divider-light);
  padding: 32px 24px;
  background-color: var(--va-c-bg);

  &.has-sidebar {
    display: none;
  }
}

@media (width >= 768px) {
  .press-footer {
    padding: 32px;
  }
}

.container {
  margin: 0 auto;
  max-width: var(--pr-layout-max-width, var(--pr-home-max-width));
  text-align: center;
}

.message,
.copyright {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--pr-c-text-2);
}

.press-footer :deep(a) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.message   { order: 2; }
.copyright { order: 1; }
</style>
