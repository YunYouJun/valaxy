import type { LocalizedValaxyAddon } from '@valaxyjs/utils'
import type { AddonInventory, AddonOperationPlan, AddonPackageDetails, InstalledAddon } from '../../shared/addons'
import { addons, localizeAddon } from '@valaxyjs/utils'
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { connectionStatus, getClient } from '../rpc'

export interface AddonCard extends Partial<LocalizedValaxyAddon> {
  name: string
  installed?: InstalledAddon
}

export function useAddonManager() {
  const { locale } = useI18n()
  const inventory = shallowRef<AddonInventory>({ installed: [], packageManager: null })
  const loading = shallowRef(false)
  const error = shallowRef('')
  const selected = shallowRef<AddonCard>()
  const details = shallowRef<AddonPackageDetails>()
  const detailError = shallowRef('')
  const detailLoading = shallowRef(false)
  const plan = shallowRef<AddonOperationPlan>()
  const actionError = shallowRef('')
  const pending = shallowRef(false)
  let refreshVersion = 0
  let detailVersion = 0
  let disposed = false
  let timer: ReturnType<typeof setTimeout> | undefined

  const cards = computed<AddonCard[]>(() => {
    const installed = new Map(inventory.value.installed.map(item => [item.name, item]))
    const result: AddonCard[] = addons.map(item => ({ ...localizeAddon(item, locale.value), installed: installed.get(item.name) }))
    for (const item of installed.values()) {
      if (!result.some(card => card.name === item.name))
        result.push({ name: item.name, description: item.description, installed: item })
    }
    return result
  })
  const running = computed(() => inventory.value.operation?.status === 'running')

  async function refresh() {
    const version = ++refreshVersion
    clearTimeout(timer)
    if (connectionStatus.value !== 'connected' || disposed)
      return
    loading.value = true
    try {
      const value = await (await getClient()).call('valaxy:get-addons')
      if (version !== refreshVersion || disposed)
        return
      inventory.value = value
      error.value = ''
    }
    catch (cause) {
      if (version === refreshVersion && !disposed)
        error.value = String(cause)
    }
    finally {
      if (version === refreshVersion && !disposed) {
        loading.value = false
        timer = setTimeout(() => void refresh(), running.value ? 1500 : 5000)
      }
    }
  }

  async function loadDetails() {
    const card = selected.value
    if (!card)
      return
    const version = ++detailVersion
    detailLoading.value = true
    detailError.value = ''
    try {
      const value = await (await getClient()).call('valaxy:get-addon-package', card.name)
      if (version === detailVersion && !disposed)
        details.value = value
    }
    catch (cause) {
      if (version === detailVersion && !disposed)
        detailError.value = String(cause)
    }
    finally {
      if (version === detailVersion && !disposed)
        detailLoading.value = false
    }
  }

  function select(card?: AddonCard) {
    detailVersion++
    selected.value = card
    details.value = undefined
    plan.value = undefined
    actionError.value = ''
    detailError.value = ''
    if (card)
      void loadDetails()
  }

  async function prepare(action: 'install' | 'remove') {
    if (!selected.value || pending.value || running.value)
      return
    pending.value = true
    actionError.value = ''
    const name = selected.value.name
    try {
      const value = await (await getClient()).call('valaxy:prepare-addon-operation', action, name)
      if (selected.value?.name === name && !disposed)
        plan.value = value
    }
    catch (cause) {
      actionError.value = String(cause)
    }
    finally {
      pending.value = false
    }
  }

  async function apply() {
    if (!plan.value || pending.value)
      return
    pending.value = true
    actionError.value = ''
    refreshVersion++
    try {
      const operation = await (await getClient()).call('valaxy:apply-addon-operation', plan.value.id)
      inventory.value = { ...inventory.value, operation }
      select()
      await refresh()
    }
    catch (cause) {
      actionError.value = String(cause)
    }
    finally {
      pending.value = false
    }
  }

  watch(connectionStatus, () => void refresh(), { immediate: true })
  onUnmounted(() => {
    disposed = true
    refreshVersion++
    detailVersion++
    clearTimeout(timer)
  })
  return { cards, inventory, loading, error, selected, details, detailError, detailLoading, plan, actionError, pending, running, refresh, select, loadDetails, prepare, apply }
}
