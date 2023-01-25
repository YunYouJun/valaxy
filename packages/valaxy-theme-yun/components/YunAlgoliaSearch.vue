<script lang="ts" setup>
import { useAddonAlgolia } from 'valaxy-addon-algolia'

const { loaded } = useAddonAlgolia()
</script>

<template>
  <AlgoliaSearchBox v-if="loaded" />
</template>
