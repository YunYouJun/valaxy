<script setup lang="ts">
import { useFrontmatter } from 'valaxy'

const fm = useFrontmatter()
</script>

<template>
  <PressFeatures
    v-if="fm.features"
    class="press-home-features"
    :features="fm.features"
  />
</template>
