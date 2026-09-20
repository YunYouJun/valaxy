<script setup lang="ts">
import type { AddonOperationPlan, AddonPackageDetails } from '../../../shared/addons'
import type { AddonCard } from '../../composables/addons'
import { useI18n } from 'vue-i18n'
import VDCodeBlock from '../VDCodeBlock.vue'

defineProps<{
  addon: AddonCard
  details?: AddonPackageDetails
  plan?: AddonOperationPlan
  error: string
  detailError: string
  detailLoading: boolean
  pending: boolean
  running: boolean
  canManage: boolean
  configFile?: string
}>()
defineEmits<{
  close: []
  retry: []
  prepare: [action: 'install' | 'remove']
  apply: []
}>()
const { t } = useI18n()
</script>

<template>
  <VDDialog :open="true" :title="addon.name" :description="addon.description" @update:open="!$event && $emit('close')">
    <div class="vd-addon-details flex flex-col gap-4 text-sm max-h-[70vh] overflow-auto">
      <VDAddonLinks :addon="addon" :details="details" />
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
      <VDOpenInEditor v-if="configFile" :file="configFile" :label="t('addons.open_config')" />
      <div v-if="plan" class="rounded border border-base p-3 space-y-3">
        <h3 class="font-medium">
          {{ t('addons.review') }}
        </h3>
        <p>{{ t(plan.action === 'install' ? 'addons.install_changes' : 'addons.remove_changes') }}</p>
        <VDCodeBlock :code="plan.command" lang="shellscript" compact class="rounded bg-secondary" />
        <VDAddonConfigPreview v-if="plan.configFile" :plan="plan" />
      </div>
      <p v-if="error" role="alert" class="text-red-600 break-words">
        {{ error }}
      </p>
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

<style scoped>
/* The shared dialog teleports its content and has no width prop. */
:global([data-af-modal]:has(.vd-addon-details)) {
  max-width: 48rem;
}
</style>
