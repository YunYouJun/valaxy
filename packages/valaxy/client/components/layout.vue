<script lang="ts" setup>
// (Component as any) will crush page rendering
import { asAny } from 'valaxy'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Component :is="asAny(Component)">
      <template #main-header>
        <slot name="main-header" />
      </template>

      <template #main-header-after>
        <slot name="main-header-after" />
      </template>
      <template #main>
        <slot name="main" />
      </template>
      <template #main-content>
        <slot name="main-content" />
      </template>
      <template #main-content-after>
        <slot name="main-content-after" />
      </template>
      <template #main-nav-before>
        <slot name="main-nav-before" />
      </template>
      <template #main-nav-after>
        <slot name="main-nav-after" />
      </template>
      <template #aside-custom>
        <slot name="aside-custom" />
      </template>
      <template #footer>
        <slot name="footer" />
      </template>
    </Component>
  </RouterView>
</template>
