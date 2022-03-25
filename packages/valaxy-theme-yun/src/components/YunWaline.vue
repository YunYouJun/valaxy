<template>
  <div id="waline" w="full" />
</template>

<script lang="ts" setup>
import { useWaline } from 'valaxy'

useWaline({
  serverURL: 'https://waline.yunyoujun.cn',
})
</script>

<style lang="scss">
#waline {
  --waline-theme-color: var(--yun-c-primary);
  --waline-active-color: var(--yun-c-primary-light);

  .v[data-class=v] {
    .veditor {
      width: calc(100% - 2em);
      padding: 0.5rem;
    }
  }
}
</style>
