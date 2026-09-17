<script setup lang="ts">
import LayoutToolbar from '@antfu/design/components/Layout/LayoutToolbar.vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { usesHostNavigation, useValaxyNavigation } from '../composables/navigation'

const { t } = useI18n()
const logoUrl = `${import.meta.env.BASE_URL}favicon.svg`
const route = useRoute()
const { current } = useValaxyNavigation()
const navigationOpen = ref(false)
watch(() => route.fullPath, () => navigationOpen.value = false)
</script>

<template>
  <header class="shrink-0 bg-base">
    <LayoutToolbar :sticky="false">
      <template #start>
        <div class="flex flex-1 min-w-0 items-center gap-2">
          <VDMenuBarBtn
            v-if="!usesHostNavigation"
            class="md:hidden"
            :aria-label="t('nav.navigation')"
            :aria-expanded="navigationOpen"
            aria-haspopup="dialog"
            @click="navigationOpen = true"
          >
            <span class="i-ph:list" aria-hidden="true" />
          </VDMenuBarBtn>
          <RouterLink to="/" class="flex shrink-0 items-center gap-1.5 font-medium text-sm color-base rounded focus-visible:ring-2 focus-visible:ring-primary-500/40" aria-label="Valaxy DevTools">
            <img :src="logoUrl" alt="" class="size-6 shrink-0" draggable="false">
            Valaxy
          </RouterLink>
          <span class="hidden sm:inline text-xs color-muted">DevTools</span>
          <span class="i-ph:caret-right shrink-0 color-muted text-xs" aria-hidden="true" />
          <span class="text-sm truncate">{{ current?.title }}</span>
        </div>
      </template>
      <template #end>
        <VDToggleLocale />
        <VDToggleDark />
        <span class="h-4 border-l border-base mx-1" aria-hidden="true" />
        <VDTooltip :content="t('nav.docs')">
          <VDMenuBarBtn tag="a" href="https://valaxy.site" target="_blank" :aria-label="t('nav.docs')">
            <span class="i-ph:book-open" aria-hidden="true" />
          </VDMenuBarBtn>
        </VDTooltip>
      </template>
    </LayoutToolbar>
    <VDDialog v-if="!usesHostNavigation" v-model:open="navigationOpen" :title="t('nav.navigation')">
      <VDNavigation @click="navigationOpen = false" />
    </VDDialog>
  </header>
</template>
