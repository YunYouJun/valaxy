<script lang="ts" setup>
import Base from 'valaxy-theme-yun/layouts/base.vue'

// override theme base(global) layout
</script>

<template>
  <Base>
    <template #content>
      <slot name="content" />
    </template>

    <slot />

    <template #nav>
      <slot name="nav" />
    </template>
    <template #comment>
      <slot name="comment" />
    </template>
    <template #footer>
      <slot name="footer" />
      <UpyunSupport />
    </template>
    <template #right-sidebar>
      <slot name="right-sidebar" />
    </template>
  </Base>
</template>
