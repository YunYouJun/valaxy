<template>
  <div id="waline" w="full" />
</template>

<script lang="ts" setup>
import { useWaline } from 'valaxy'
import { useRoute } from 'vue-router'

const route = useRoute()
useWaline({
  serverURL: 'https://waline.yunyoujun.cn',
  path: route.path,
})
</script>

<style lang="scss">
#waline {
  --waline-theme-color: var(--yun-c-primary);
  --waline-active-color: var(--yun-c-primary-light);

  .v[data-class=v] {
    .vpanel {
      margin: 0;
    }
    .veditor {
      width: calc(100% - 2em);
      padding: 0.5rem;
    }
  }
}
</style>
