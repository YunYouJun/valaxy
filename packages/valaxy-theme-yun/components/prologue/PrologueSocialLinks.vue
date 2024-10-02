<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div flex="~ wrap" class="justify-center items-center mx-5">
    <PrologueSocialIcon
      v-for="item, i in siteConfig.social"
      :key="i"
      :social="item"
      :delay="i * 50 + 1000"
    />
  </div>
</template>
