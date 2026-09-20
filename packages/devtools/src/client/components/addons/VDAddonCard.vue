<script setup lang="ts">
import type { AddonCard } from '../../composables/addons'
import LayoutCard from '@antfu/design/components/Layout/LayoutCard.vue'
import { useI18n } from 'vue-i18n'
import { identityColor } from '../../utils/colors'

defineProps<{ addon: AddonCard }>()
defineEmits<{ select: [addon: AddonCard] }>()
const { t } = useI18n()
</script>

<template>
  <LayoutCard class="flex flex-col gap-3 min-w-0" :data-addon="addon.name">
    <div class="flex items-start gap-3">
      <span :class="addon.icon || 'i-ph:puzzle-piece'" class="text-2xl shrink-0 mt-1 vd-accent" :style="identityColor(addon.name)" aria-hidden="true" />
      <div class="min-w-0 flex-1">
        <h2 class="font-medium break-words">
          {{ addon.name }}
        </h2>
        <div class="text-xs color-muted mt-1">
          {{ addon.author?.join(' · ') || t('addons.local_addon') }}
        </div>
      </div>
      <span v-if="addon.kind" class="text-xs color-muted">{{ t(`addons.${addon.kind}`) }}</span>
    </div>
    <p class="text-sm color-muted flex-1">
      {{ addon.description || t('addons.no_description') }}
    </p>
    <div class="flex flex-wrap gap-2 text-xs color-muted">
      <span v-for="tag in addon.tags" :key="tag" class="border border-base rounded px-2 py-0.5">{{ tag }}</span>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base">
      <span v-if="addon.installed" class="text-xs" :class="addon.installed.enabled ? 'text-primary-600' : 'color-muted'">
        {{ t(addon.installed.enabled ? 'addons.enabled' : 'addons.installed') }} · {{ addon.installed.version || addon.installed.specifier }}
      </span>
      <span v-else class="text-xs color-muted">{{ t('addons.not_installed') }}</span>
      <button class="btn-action text-sm" @click="$emit('select', addon)">
        {{ t('addons.details') }}<span class="i-ph:arrow-right ml-1" aria-hidden="true" />
      </button>
    </div>
  </LayoutCard>
</template>
