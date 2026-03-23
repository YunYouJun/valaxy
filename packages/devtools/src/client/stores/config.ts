import type { ConfigData } from '../../../rpc'
import { ref } from 'vue'
import { rpc } from '../rpc'

export const configData = ref<ConfigData | null>(null)
export const configLoading = ref(false)
export const configSaving = ref(false)
export const configSaveMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

let clearMessageTimer: ReturnType<typeof setTimeout> | undefined

function queueClearSaveMessage() {
  if (clearMessageTimer)
    clearTimeout(clearMessageTimer)

  clearMessageTimer = setTimeout(() => {
    configSaveMessage.value = null
    clearMessageTimer = undefined
  }, 3000)
}

export async function fetchConfig() {
  configLoading.value = true
  try {
    configData.value = await rpc.getConfig()
  }
  catch (e: any) {
    console.error('[devtools] Failed to fetch config:', e)
  }
  finally {
    configLoading.value = false
  }
}

export async function saveConfigField(
  configType: 'site' | 'valaxy' | 'theme',
  fieldPath: string,
  value: any,
) {
  configSaving.value = true
  configSaveMessage.value = null
  try {
    const result = await rpc.updateConfigField(configType, fieldPath, value)
    if (result.success) {
      configSaveMessage.value = { type: 'success', text: 'Saved' }
      // Refresh config data after save
      await fetchConfig()
    }
    else {
      configSaveMessage.value = { type: 'error', text: result.error || 'Save failed' }
    }
  }
  catch (e: any) {
    configSaveMessage.value = { type: 'error', text: e.message || 'Save failed' }
  }
  finally {
    configSaving.value = false
    queueClearSaveMessage()
  }
}
