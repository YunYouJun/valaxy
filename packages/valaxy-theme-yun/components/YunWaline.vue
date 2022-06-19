<script lang="ts" setup>
import { useConfig, useWaline } from 'valaxy'

const config = useConfig()
useWaline(config.value.comment.waline)
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
