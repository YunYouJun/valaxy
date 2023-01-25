<script lang="ts" setup>
import type { PressTheme } from '../types'

defineProps<{
  links: PressTheme.SocialLink[]
}>()
</script>

<template>
  <div class="pr-social-links">
    <PressSocialLink
      v-for="{ link, icon } in links"
      :key="link"
      :icon="icon"
      :link="link"
    />
  </div>
</template>

<style scoped>
.pr-social-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
