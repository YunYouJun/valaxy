<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { connectionError, connectionStatus, getClient, reconnect } from '../rpc'

const { t } = useI18n()
const code = ref('')
const busy = ref(false)

async function requestCode() {
  try {
    await (await getClient()).requestAuthCode()
  }
  catch (error) {
    connectionError.value = String(error)
  }
}

watch(connectionStatus, (status) => {
  if (status === 'unauthorized')
    void requestCode()
}, { immediate: true })

async function connect() {
  busy.value = true
  connectionError.value = ''
  try {
    if (!await (await getClient()).requestTrustWithCode(code.value.trim()))
      connectionError.value = t('connection.invalid_code')
  }
  catch (error) {
    connectionError.value = String(error)
  }
  finally {
    busy.value = false
  }
}

async function retry() {
  try {
    await reconnect()
  }
  catch {}
}
</script>

<template>
  <div class="max-w-md mx-auto my-auto p-6 flex flex-col gap-4" role="status">
    <h1 class="text-xl font-bold">
      Valaxy DevTools
    </h1>
    <template v-if="connectionStatus === 'unauthorized'">
      <p>{{ t('connection.authorize') }}</p>
      <form class="flex gap-2" @submit.prevent="connect">
        <VDInput v-model="code" :aria-label="t('connection.code')" inputmode="numeric" autocomplete="one-time-code" class="flex-1" size="md" required />
        <VDButton type="submit" :disabled="busy">
          {{ t('connection.connect') }}
        </VDButton>
      </form>
      <button class="text-left text-sm underline" @click="requestCode">
        {{ t('connection.request_code') }}
      </button>
    </template>
    <p v-else>
      {{ t(`connection.${connectionStatus}`) }}
    </p>
    <p v-if="connectionError" class="text-error-700 dark:text-error-300" role="alert">
      {{ connectionError }}
    </p>
    <VDButton v-if="connectionStatus === 'error' || connectionStatus === 'disconnected'" @click="retry">
      {{ t('connection.retry') }}
    </VDButton>
  </div>
</template>
