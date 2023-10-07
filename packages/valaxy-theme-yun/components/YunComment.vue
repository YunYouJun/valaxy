<script lang="ts" setup>
import { useRuntimeConfig } from 'valaxy'
import { defineAsyncComponent } from 'vue'

const runtimeConfig = useRuntimeConfig()

// not import from 'valaxy-addon-waline' to judge
const AsyncYunWaline = runtimeConfig.value.addons['valaxy-addon-waline']
  ? defineAsyncComponent(() => import('./third/YunWaline.vue'))
  : () => null

// todo: refactor
const AsyncYunTwikoo = runtimeConfig.value.addons['valaxy-addon-twikoo']
  ? defineAsyncComponent(() => import('./third/YunTwikoo.vue'))
  : () => null
</script>

<template>
  <YunCard w="full" p="4" class="comment sm:p-6 lg:px-12 xl:px-16">
    <ClientOnly>
      <AsyncYunWaline />
      <AsyncYunTwikoo />
    </ClientOnly>
  </YunCard>
</template>

<style lang="scss">
.comment {
  h1 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h5 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h6 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  ul {
    list-style: disc;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }

  ol {
    list-style: decimal;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }
}
</style>
