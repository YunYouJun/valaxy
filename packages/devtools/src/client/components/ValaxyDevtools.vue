<script lang="ts" setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHostNavigation, usesHostNavigation, useValaxyNavigation } from '../composables/navigation'
import { useValaxyDevtools } from '../composables/useValaxyDevtools'
import { connectionError, connectionStatus } from '../rpc'
import { connectFrameNavigation } from '../utils/frame-navigation'

useValaxyDevtools()
useHostNavigation()
const router = useRouter()
const { tabs } = useValaxyNavigation()
watch(usesHostNavigation, (enabled, _previous, onCleanup) => {
  if (!enabled)
    return
  const navigation = connectFrameNavigation(router, {
    tabs: () => tabs.value,
    onError: error => connectionError.value = String(error),
  })
  const stop = watch(tabs, () => navigation.update())
  onCleanup(() => {
    stop()
    navigation.dispose()
  })
}, { immediate: true })
</script>

<template>
  <main class="h-full overflow-hidden bg-base color-base" flex="~ col">
    <VDHeader v-if="connectionStatus === 'connected'" />
    <VDConnectionState v-if="connectionStatus !== 'connected'" />
    <div v-else class="flex flex-1 min-h-0 overflow-hidden">
      <VDNavigation v-if="!usesHostNavigation" class="hidden md:flex w-44 shrink-0 border-r border-base overflow-y-auto" />
      <div class="flex-1 min-w-0 overflow-auto">
        <VDMessage v-if="connectionError" :key="connectionError" severity="error" closable role="alert" class="m-2">
          {{ connectionError }}
        </VDMessage>
        <slot />
      </div>
    </div>
  </main>
</template>
