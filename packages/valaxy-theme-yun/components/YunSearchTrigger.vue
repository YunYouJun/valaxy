<script lang="ts" setup>
import { computed } from '@vue/reactivity'
import { useSiteConfig } from 'valaxy'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMagicKeys } from '@vueuse/core'

const siteConfig = useSiteConfig()
const { t } = useI18n()

// to avoid loading the docsearch js upfront (which is more than 1/3 of the
// payload), we delay initializing it until the user has actually clicked or
// hit the hotkey to invoke it.
const loaded = ref(false)

function load() {
  if (!loaded.value)
    loaded.value = true
}

const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')

const open = ref(false)

const togglePopup = () => {
  open.value = !open.value
}

const { Meta_K } = useMagicKeys()

watch(Meta_K, (val) => {
  if (val) {
    togglePopup()
    load()
  }
})
</script>

<template>
  <button class="search-btn popup-trigger yun-icon-btn" :title="t('menu.search')" @click="togglePopup">
    <div v-if="!open" i-ri-search-line />
    <div v-else text="!2xl" i-ri-close-line />
  </button>

  <AlgoliaSearchBox v-if="isAlgolia && loaded" />
  <YunFuseSearch v-else-if="siteConfig.search.type === 'fuse'" :open="open" @close="open = false" />
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy/client/styles/vars' as *;

.search-btn {
  position: fixed;
  top: 0.6rem;
  right: 0.8rem;

  color: var(--va-c-primary);
  z-index: var(--yun-z-search-btn);
}
</style>
