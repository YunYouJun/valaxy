<script lang="ts" setup>
import { computed } from '@vue/reactivity'
import { useSiteConfig } from 'valaxy'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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

onMounted(() => {
  if (!isAlgolia.value)
    return

  const handleSearchHotKey = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      load()
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      remove()
    }
  }

  const remove = () => {
    window.removeEventListener('keydown', handleSearchHotKey)
  }

  window.addEventListener('keydown', handleSearchHotKey)

  onUnmounted(remove)
})

const trigger = () => {
  const e = new Event('keydown') as any

  e.key = 'k'
  e.metaKey = true

  window.dispatchEvent(e)
}
</script>

<template>
  <div>
    <button class="search-btn popup-trigger yun-icon-btn" :title="t('menu.search')" @click="trigger">
      <div i-ri-search-line />
      <!-- <div v-else text="!2xl" i-ri-close-line /> -->
    </button>

    <AlgoliaSearchBox v-if="isAlgolia && loaded" />
  </div>
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

.search-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);

  text-align: center;
  padding-top: 3.5rem;
  margin: 0;
  z-index: var(--yun-z-search-popup);
  transition: 0.6s;
}

.search-header {
  .close-icon {
    position: fixed;
    top: 0.6rem;
    right: 0.8rem;
  }
}

.search-input {
  background: transparent;
  color: var(--va-c-text);
  font-size: 1.5rem;
  border-radius: 3rem;
  padding: 1rem 1.5rem;
  border: 1px solid var(--va-c-gray);
  box-sizing: border-box;
  width: 90%;
  max-width: 800px;
  font-family: var(--va-font-serif);
  font-weight: 900;
  text-align: center;
}

.popup {
  .search-icon, .close-icon {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    padding: 0.5rem;

    .icon {
      width: 2rem;
      height: 2rem;
    }
  }
}
</style>
