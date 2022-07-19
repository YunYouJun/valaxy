<script lang="ts" setup>
// @ts-expect-error virtual
import addonComponents from '/@valaxyjs/addons'
</script>

<template>
  <component :is="component" v-bind="props" v-for="({ component, props }, index) in addonComponents" :key="index" />
</template>

<style lang="scss" scoped></style>
