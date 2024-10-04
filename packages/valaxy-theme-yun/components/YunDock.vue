<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import TerminalService from 'primevue/terminalservice'
import Dock from 'primevue/dock'
import Toast from 'primevue/toast'
import { useYunAppStore } from '../stores'

onMounted(() => {
  TerminalService.on('command', commandHandler)
})

onBeforeUnmount(() => {
  TerminalService.off('command', commandHandler)
})

const yunApp = useYunAppStore()
const showDock = ref(false)
watch(() => yunApp.scrollY, () => {
  if (yunApp.scrollY > 10)
    showDock.value = true
  else
    showDock.value = false
})

const displayFinder = ref(false)
const displayTerminal = ref(false)
const displayPhotos = ref(false)
const toast = useToast()
const items = ref([
  {
    label: 'Finder',
    icon: 'https://primefaces.org/cdn/primevue//images/dock/finder.svg',
    command: () => {
      displayFinder.value = true
    },
  },
  {
    label: 'Terminal',
    icon: 'https://primefaces.org/cdn/primevue//images/dock/terminal.svg',
    command: () => {
      displayTerminal.value = true
    },
  },
  {
    label: 'App Store',
    icon: 'https://primefaces.org/cdn/primevue//images/dock/appstore.svg',
    command: () => {
      toast.add({ severity: 'error', summary: 'An unexpected error occurred while signing in.', detail: 'UNTRUSTED_CERT_TITLE', group: 'tc', life: 3000 })
    },
  },
  {
    label: 'Safari',
    icon: 'https://primefaces.org/cdn/primevue//images/dock/safari.svg',
    command: () => {
      toast.add({ severity: 'warn', summary: 'Safari has stopped working', group: 'tc', life: 3000 })
    },
  },
  {
    label: 'Photos',
    icon: 'https://primefaces.org/cdn/primevue//images/dock/photos.svg',
    command: () => {
      displayPhotos.value = true
    },
  },
  {
    label: 'GitHub',
    icon: 'https://primefaces.org/cdn/primevue//images/dock/github.svg',
  },
  {
    label: 'Trash',
    icon: 'https://primefaces.org/cdn/primevue//images/dock/trash.png',
    command: () => {
      toast.add({ severity: 'info', summary: 'Empty Trash', life: 3000 })
    },
  },
])

function onDockItemClick(event, item) {
  if (item.command)
    item.command()

  event.preventDefault()
}

function commandHandler(text) {
  let response
  const argsIndex = text.indexOf(' ')
  const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text

  switch (command) {
    case 'date':
      response = `Today is ${new Date().toDateString()}`
      break

    case 'greet':
      response = `Hola ${text.substring(argsIndex + 1)}`
      break

    case 'random':
      response = Math.floor(Math.random() * 100)
      break

    default:
      response = `Unknown command: ${command}`
  }

  TerminalService.emit('response', response)
}
</script>

<template>
  <Toast position="top-center" group="tc" />

  <!-- yun-dock slide in -->
  <Transition
    name="custom-classes"
    enter-from-class="opacity-0 translate-y-10"
    enter-to-class="opacity-100 translate-y-0"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-10"
  >
    <Dock
      v-show="showDock"
      class="fixed bottom-0 left-0 right-0 z-99 transition" flex="~"
      :model="items"
    >
      <template #item="{ item }">
        <a
          v-tooltip.top="item.label" href="#"
          class="yun-dock-item-link" @click="onDockItemClick($event, item)"
        >
          <img :alt="item.label" :src="item.icon" style="width: 100%">
        </a>
      </template>
    </Dock>
  </Transition>

  <!-- <div class="dock-window dock-advanced">
    <Dialog v-model:visible="displayTerminal" header="Terminal" :breakpoints="{ '960px': '50vw' }" :style="{ width: '40vw' }" :maximizable="true">
      <Terminal welcome-message="Welcome to PrimeVue(cmd: 'date', 'greet {0}' and 'random')" prompt="primevue $" />
    </Dialog>

    <Dialog v-model:visible="displayFinder" header="Finder" :breakpoints="{ '960px': '50vw' }" :style="{ width: '40vw' }" :maximizable="true">
      <Tree :value="nodes" />
    </Dialog>

    <Galleria v-model:visible="displayPhotos" :value="images" :responsive-options="responsiveOptions" :num-visible="2" container-style="width: 400px" :circular="true" :full-screen="true" :show-thumbnails="false" :show-item-navigators="true">
      <template #item="slotProps">
        <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 100%">
      </template>
    </Galleria>
  </div> -->
</template>

<style lang="scss">
:root {
  --p-dock-background: rgb(255 255 255 / 0.1);
  --p-dock-border-color: rgb(255 255 255 / 0.2);
  --p-dock-padding: 0.5rem;
  --p-dock-border-radius: var(--p-border-radius-xl);
  --p-dock-item-border-radius: var(--p-content-border-radius);
  --p-dock-item-padding: 0.5rem;
  --p-dock-item-size: 3rem;
  --p-dock-item-focus-ring-width: var(--p-focus-ring-width);
  --p-dock-item-focus-ring-style: var(--p-focus-ring-style);
  --p-dock-item-focus-ring-color: var(--p-focus-ring-color);
  --p-dock-item-focus-ring-offset: var(--p-focus-ring-offset);
  --p-dock-item-focus-ring-shadow: var(--p-focus-ring-shadow);
}

.yun-dock {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--yun-z-dock);

  &-bottom {
    left: 0;
    bottom: 0;
    width: 100%;
  }

  .yun-dock-list-container {
    display: flex;
    pointer-events: auto;
    background: var(--p-dock-background);
    border: 1px solid var(--p-dock-border-color);
    padding: var(--p-dock-padding);
    border-radius: var(--p-dock-border-radius);
  }
}

.yun-dock-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: 0 none;
}

.yun-dock-item {
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
  padding: var(--p-dock-item-padding);
  border-radius: var(--p-dock-item-border-radius);
}

.yun-dock-item-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  width: var(--p-dock-item-size);
  height: var(--p-dock-item-size);
}
</style>
