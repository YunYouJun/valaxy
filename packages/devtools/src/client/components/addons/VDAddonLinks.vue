<script setup lang="ts">
import type { AddonPackageDetails } from '../../../shared/addons'
import type { AddonCard } from '../../composables/addons'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ addon: AddonCard, details?: AddonPackageDetails }>()
const { t } = useI18n()
const repository = computed(() => props.addon.repo || props.details?.repository)
const documentation = computed(() => props.addon.docs ? `https://valaxy.site${props.addon.docs}` : props.details?.homepage)
const isGitHub = computed(() => repository.value?.startsWith('https://github.com/'))
</script>

<template>
  <div class="vd-addon-links flex flex-wrap gap-2">
    <a :href="`https://www.npmjs.com/package/${addon.name}`" target="_blank" rel="noopener noreferrer" class="btn-action inline-flex items-center gap-2">
      <span class="i-simple-icons:npm text-red-500" aria-hidden="true" />
      npm
      <span class="i-ph:arrow-up-right text-xs color-muted" aria-hidden="true" />
    </a>
    <a v-if="repository" :href="repository" target="_blank" rel="noopener noreferrer" class="btn-action inline-flex items-center gap-2">
      <span :class="isGitHub ? 'i-simple-icons:github' : 'i-ph:git-branch'" aria-hidden="true" />
      {{ isGitHub ? 'GitHub' : t('addons.repository') }}
      <span class="i-ph:arrow-up-right text-xs color-muted" aria-hidden="true" />
    </a>
    <a v-if="documentation" :href="documentation" target="_blank" rel="noopener noreferrer" class="btn-action inline-flex items-center gap-2">
      <span class="i-ph:book-open text-primary-500" aria-hidden="true" />
      {{ t('addons.documentation') }}
      <span class="i-ph:arrow-up-right text-xs color-muted" aria-hidden="true" />
    </a>
  </div>
</template>
