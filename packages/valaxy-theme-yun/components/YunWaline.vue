<script lang="ts" setup>
import { useWalineOptions } from 'valaxy-addon-waline'
const walineOptions = useWalineOptions()
</script>

<template>
  <WalineClient w="full" :options="walineOptions" />
</template>
