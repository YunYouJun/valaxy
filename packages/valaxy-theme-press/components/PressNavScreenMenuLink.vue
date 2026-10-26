<script lang="ts" setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  text: string
  link: string
}>()

const closeScreen = inject('close-screen') as () => void
const { t } = useI18n()
</script>

<template>
  <AppLink class="pr-nav-screen-menu-link" :href="link" @click="closeScreen">
    {{ t(text) }}
  </AppLink>
</template>

<style scoped>
.pr-nav-screen-menu-link {
  display: block;
  border-bottom: 1px solid var(--pr-c-divider-light);
  padding: 14px 0 13px;
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--pr-c-text-1);
  transition: border-color var(--va-transition-duration), color var(--va-transition-duration);
}

.pr-nav-screen-menu-link:hover {
  color: var(--pr-c-brand);
}
</style>
