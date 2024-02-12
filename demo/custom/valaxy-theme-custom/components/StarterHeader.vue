<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="pt-6 pb-8 space-y-2 md:space-y-5">
    <h1
      class="
          st-text
          text-3xl
          leading-9
          font-extrabold
          tracking-tight
          sm:text-4xl sm:leading-10
          md:text-6xl md:leading-14
        "
    >
      {{ siteConfig.title }}
    </h1>
    <p class="text-lg leading-7 text-gray-500">
      {{ siteConfig.subtitle }}
    </p>
  </div>
</template>
