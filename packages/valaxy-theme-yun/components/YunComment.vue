<script lang="ts" setup>
import { useRuntimeConfig } from 'valaxy'
import { defineAsyncComponent } from 'vue'

const runtimeConfig = useRuntimeConfig()

// not import from 'valaxy-addon-waline' to judge
const YunWaline = runtimeConfig.value.addons['valaxy-addon-waline']
  ? defineAsyncComponent(() => import('./YunWaline.vue'))
  : () => null

// todo: refactor
const YunTwikoo = runtimeConfig.value.addons['valaxy-addon-twikoo']
  ? defineAsyncComponent(() => import('./YunTwikoo.vue'))
  : () => null
</script>

<template>
  <YunCard w="full" p="4" class="comment sm:p-6 lg:px-12 xl:px-16">
    <ClientOnly>
      <YunWaline />
      <YunTwikoo />
    </ClientOnly>
  </YunCard>
</template>
