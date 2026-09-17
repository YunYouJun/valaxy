<script setup lang="ts">
import LayoutSideNav from '@antfu/design/components/Layout/LayoutSideNav.vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useValaxyNavigation } from '../composables/navigation'

const { t } = useI18n()
const route = useRoute()
const { items } = useValaxyNavigation()
</script>

<template>
  <LayoutSideNav :items="items" :model-value="route.path" :aria-label="t('nav.navigation')" />
</template>
