<script setup lang="ts">
import type { AddonOperationPlan, AddonPackageDetails } from '../../../shared/addons'
import type { AddonCard } from '../../composables/addons'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VDCodeBlock from '../VDCodeBlock.vue'

const props = defineProps<{
  addon: AddonCard
  details?: AddonPackageDetails
  plan?: AddonOperationPlan
  error: string
  detailError: string
  detailLoading: boolean
  pending: boolean
  running: boolean
  canManage: boolean
  hasConfig: boolean
}>()
defineEmits<{
  close: []
  retry: []
  prepare: [action: 'install' | 'remove']
  apply: []
  openConfig: []
}>()
const { t } = useI18n()
const configLanguage = computed(() => /\.[cm]?js$/i.test(props.plan?.configFile || '') ? 'js' : 'ts')
</script>

<template>
  <VDDialog :open="true" :title="addon.name" :description="addon.description" @update:open="!$event && $emit('close')">
    <div class="flex flex-col gap-4 text-sm max-h-[65vh] overflow-auto">
      <div class="flex flex-wrap gap-3">
        <a :href="`https://www.npmjs.com/package/${addon.name}`" target="_blank" rel="noopener noreferrer" class="text-primary-600">npm ↗</a>
        <a v-if="addon.repo || details?.repository" :href="addon.repo || details?.repository" target="_blank" rel="noopener noreferrer" class="text-primary-600">{{ t('addons.repository') }} ↗</a>
        <a v-if="addon.docs" :href="`https://valaxy.site${addon.docs}`" target="_blank" rel="noopener noreferrer" class="text-primary-600">{{ t('addons.documentation') }} ↗</a>
        <a v-else-if="details?.homepage" :href="details.homepage" target="_blank" rel="noopener noreferrer" class="text-primary-600">{{ t('addons.documentation') }} ↗</a>
      </div>
      <p v-if="detailLoading" role="status" class="color-muted">
        {{ t('addons.loading_package') }}
      </p>
      <div v-if="detailError" role="alert" class="color-muted">
        <p class="break-words">
          {{ detailError }}
        </p>
        <button class="btn-action mt-2" @click="$emit('retry')">
          {{ t('addons.retry') }}
        </button>
      </div>
      <dl v-if="details" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        <dt class="color-muted">
          {{ t('addons.latest') }}
        </dt><dd class="font-mono">
          {{ details.version }}
        </dd>
        <template v-if="details.license">
          <dt class="color-muted">
            {{ t('addons.license') }}
          </dt><dd>{{ details.license }}</dd>
        </template>
        <template v-for="(range, dependency) in details.peerDependencies" :key="dependency">
          <dt class="color-muted break-words">
            {{ dependency }}
          </dt><dd class="font-mono break-words">
            {{ range }}
          </dd>
        </template>
      </dl>
      <p class="text-xs color-muted">
        {{ t('addons.install_note') }}
      </p>
      <p v-if="addon.installed && !addon.installed.direct" class="text-xs color-muted">
        {{ t('addons.inherited_hint') }}
      </p>
      <div v-if="plan" class="rounded border border-base p-3 space-y-3">
        <h3 class="font-medium">
          {{ t('addons.review') }}
        </h3>
        <p>{{ t(plan.action === 'install' ? 'addons.install_changes' : 'addons.remove_changes') }}</p>
        <VDCodeBlock :code="plan.command" lang="shellscript" compact class="rounded bg-secondary" />
        <details v-if="plan.configFile">
          <summary class="cursor-pointer">
            {{ t('addons.config_changes') }}
          </summary>
          <p class="text-xs color-muted my-2 break-all">
            {{ plan.configFile }}
          </p>
          <h4 class="text-xs font-medium">
            {{ t('addons.before') }}
          </h4>
          <VDCodeBlock :code="plan.configBefore ?? ''" :lang="configLanguage" compact class="rounded bg-secondary my-2" />
          <h4 class="text-xs font-medium">
            {{ t('addons.after') }}
          </h4>
          <VDCodeBlock :code="plan.configAfter ?? ''" :lang="configLanguage" compact class="rounded bg-secondary my-2" />
        </details>
      </div>
      <p v-if="error" role="alert" class="text-red-600 break-words">
        {{ error }}
      </p>
      <button v-if="hasConfig" class="btn-action self-start" @click="$emit('openConfig')">
        {{ t('addons.open_config') }}
      </button>
    </div>
    <template #footer>
      <VDButton variant="ghost" :disabled="pending" @click="$emit('close')">
        {{ t('addons.cancel') }}
      </VDButton>
      <VDButton v-if="plan" :variant="plan.action === 'remove' ? 'warn' : 'default'" :loading="pending" :disabled="running || !canManage" @click="$emit('apply')">
        {{ t(plan.action === 'remove' ? 'addons.confirm_remove' : 'addons.confirm_install') }}
      </VDButton>
      <VDButton v-else-if="addon.installed?.direct" variant="warn" :loading="pending" :disabled="running || !canManage" @click="$emit('prepare', 'remove')">
        {{ t('addons.remove') }}
      </VDButton>
      <VDButton v-else-if="!addon.installed && addon.kind" :loading="pending" :disabled="running || !canManage" @click="$emit('prepare', 'install')">
        {{ t('addons.install') }}
      </VDButton>
    </template>
  </VDDialog>
</template>
