<script setup lang="ts">
// export layouts/base.vue as components
import Base from '../layouts/base.vue'
</script>

<template>
  <Base>
    <template #content>
      <slot name="content" />
    </template>
    <template #nav>
      <slot name="nav" />
    </template>
    <template #comment>
      <slot name="comment" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
    <template #right-sidebar>
      <slot name="right-sidebar" />
    </template>
  </Base>
</template>
