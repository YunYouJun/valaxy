<script lang="ts" setup>
import { useAddonWaline } from 'valaxy-addon-waline'
const addon = useAddonWaline()
</script>

<template>
  <WalineClient w="full" :options="addon.options" />
</template>
