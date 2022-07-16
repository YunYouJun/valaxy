<script lang="ts" setup>
import { useSite } from 'valaxy'
// we need import on demand
import { useWaline } from 'valaxy/client/composables/comments/waline'

const config = useSite()
useWaline(config.value.comment.waline, config.value.cdn.prefix)
</script>

<template>
  <div id="waline" w="full" />
</template>

<style lang="scss">
#waline {
  --waline-theme-color: var(--va-c-primary);
  --waline-active-color: var(--va-c-primary-light);

  .v[data-class=v] {
    .veditor {
      width: calc(100% - 2em);
      padding: 0.5rem;
    }
  }
}
</style>
