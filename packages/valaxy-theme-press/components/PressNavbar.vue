<script lang="ts" setup>
import { useSidebar } from 'valaxy'

defineProps<{
  isScreenOpen: boolean
}>()

defineEmits<{
  (e: 'toggle-screen'): void
}>()

const { hasSidebar } = useSidebar()
</script>

<template>
  <div class="press-navbar" :class="{ 'has-sidebar': hasSidebar }">
    <div class="container" />
  </div>
</template>

<style lang="scss" scoped>
@use 'valaxy/client/styles/mixins' as *;

.press-navbar {
  position: relative;
  border-bottom: 1px solid var(--pr-c-divider-light);
  padding: 0 8px 0 24px;
  height: var(--pr-nav-height-mobile);
  transition: border-color 0.5s, background-color 0.5s;
}

@include media('md') {
  .press-navbar {
    padding: 0 32px;
  }
}

@include media('md') {
  .press-navbar {
    height: var(--pr-nav-height-desktop);
    border-bottom: 0;
  }

  .press-navbar.has-sidebar .content {
    margin-right: -32px;
    padding-right: 32px;
    -webkit-backdrop-filter: saturate(50%) blur(8px);
    backdrop-filter: saturate(50%) blur(8px);
    background: rgba(255, 255, 255, 0.7);
  }

  .dark .press-navbar.has-sidebar .content {
    background: rgba(36, 36, 36, 0.7);
  }

  @supports not (backdrop-filter: saturate(50%) blur(8px)) {
    .press-navbar.has-sidebar .content {
      background: rgba(255, 255, 255, 0.95);
    }

    .dark .press-navbar.has-sidebar .content {
      background: rgba(36, 36, 36, 0.95);
    }
  }
}

.container {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: calc(var(--pr-layout-max-width) - 64px);
}

.content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-grow: 1;
}

.menu + .translations::before,
.menu + .appearance::before,
.menu + .social-links::before,
.translations + .appearance::before,
.appearance + .social-links::before {
  margin-right: 8px;
  margin-left: 8px;
  width: 1px;
  height: 24px;
  background-color: var(--pr-c-divider-light);
  content: "";
}

.menu + .appearance::before,
.translations + .appearance::before {
  margin-right: 16px;
}

.appearance + .social-links::before {
  margin-left: 16px;
}

.social-links {
  margin-right: -8px;
}
</style>
