<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useConfig } from 'valaxy'
import { useAlgoliaSearch } from '~/composables/search/algolia'

const { t } = useI18n()

const config = useConfig()
const showPopup = ref(false)

const { Escape } = useMagicKeys()

useAlgoliaSearch({
  ...config.value.search.algolia,
  hits: {
    per_page: 8,
  },
})

watch(Escape, () => {
  showPopup.value = false
})

watch(showPopup, () => {
  if (showPopup.value)
    document.documentElement.classList.add('no-scroll')
  else
    document.documentElement.classList.remove('no-scroll')
})

</script>

<template>
  <button class="search-btn popup-trigger yun-icon-btn" :title="t('menu.search')" @click="showPopup = !showPopup">
    <div v-if="!showPopup" i-ri-search-line />
    <div v-else text="!2xl" i-ri-close-line />
  </button>

  <transition>
    <div v-show="showPopup" class="search-popup">
      <div class="search-header" />
      <div class="search-input-container" />
      <div class="algolia-results">
        <div id="algolia-stats" />
        <div id="algolia-hits" />
        <div id="algolia-pagination" class="algolia-pagination" />
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
@use 'sass:map';
@use '~/styles/vars' as *;

.search-btn {
  position: fixed;
  top: 0.6rem;
  right: 0.8rem;

  color: var(--yun-c-primary);
  z-index: map.get($z-index, 'search-btn');
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
  z-index: map.get($z-index, 'search-popup');
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
  color: var(--yun-c-text);
  font-size: 1.5rem;
  border-radius: 3rem;
  padding: 1rem 1.5rem;
  border: 1px solid var(--yun-c-gray);
  box-sizing: border-box;
  width: 90%;
  max-width: 800px;
  font-family: var(--yun-font-serif);
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

.ais-Stats {
  .ais-Stats-text {
    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;

    padding-bottom: 8px;
    margin-bottom: 8px;
    font-size: small;
  }
}

.algolia-powered {
  position: absolute;
  top: 0;
  right: 1rem;

  display: inline-flex;
  justify-content: center;
  align-items: center;

  img {
    width: 1rem;
    height: 1rem;
    display: inline-flex;
  }
}

.algolia-results {
  position: relative;
  overflow: auto;
  padding: 10px 30px 0 30px;

  hr {
    margin-top: 10px;
    margin-bottom: 0;
  }
}

.algolia-hit-item {
  display: flex;
  justify-content: center;
}

.algolia-hit-item-link {
  display: block;
  width: 100%;
  padding: 0.5rem;
  border-bottom: 1px dashed #ccc;
  font-family: var(--yun-font-serif);
  font-weight: 900;
  font-size: 1.2rem;
  max-width: 800px;

  mark {
    color: var(--yun-c-danger);
    font-family: 900;
    background-color: transparent;
    text-decoration: underline;
  }

  small {
    display: flex;
    font-size: 12px;
    justify-content: center;
    font-family: var(--yun-font-sans);
    font-weight: normal;
    line-height: 1;
    margin-top: -0.2rem;
  }
}

.algolia-pagination {
  margin-top: 1rem;
  .ais-Pagination-list {
    display: flex;
    padding-inline-start: 0;
  }

  .pagination-item {
    display: inline-flex;
    list-style-type: none;
  }

  .page-number {
    border-top: none;
  }

  .disabled-item {
    display: none;
  }

  .active {
    .page-number {
      background: var(--page-btn-active-bg-color);
      color: var(--yun-c-bg);
    }
  }
}

.ais-Hits-list {
  margin: 0;
  list-style-type: none;
  padding-inline-start: 0;
}
</style>
