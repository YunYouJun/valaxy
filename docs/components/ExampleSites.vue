<script lang="ts" setup>
import { sites } from '../assets/sites'
</script>

<template>
  <div grid="~ cols-7" gap="2">
    <div v-for="item in sites" :key="item.url" inline-grid class="px-1 py-2">
      <ExampleSite :site="item" />
    </div>
  </div>
</template>
