<script lang="ts" setup>
import { useLocale } from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleConfig } from '../composables'

const { t, locale } = useI18n()
const { toggleLocales } = useLocale()
const { hasLocales, availableLocales, currentLocaleKey, getLocalePath } = useLocaleConfig()

const dropdownOpen = ref(false)

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}
</script>

<template>
  <!-- Dropdown mode: when locales config exists -->
  <div v-if="hasLocales" class="pr-locale-selector" @mouseleave="closeDropdown">
    <button :title="t('button.toggle_langs')" class="pr-locale-trigger" @click="toggleDropdown">
      <div i-ri-translate class="transition transform" />
      <div i-ri-arrow-down-s-line class="pr-locale-arrow" :class="{ open: dropdownOpen }" />
    </button>
    <div v-show="dropdownOpen" class="pr-locale-dropdown">
      <RouterLink
        v-for="loc in availableLocales"
        :key="loc.key"
        :to="getLocalePath(loc.key)"
        class="pr-locale-option"
        :class="{ active: loc.key === currentLocaleKey }"
        @click="closeDropdown"
      >
        {{ loc.label }}
      </RouterLink>
    </div>
  </div>

  <!-- Legacy toggle mode: no locales config -->
  <button v-else :title="t('button.toggle_langs')" @click="toggleLocales">
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </button>
</template>

<style scoped>
.pr-locale-selector {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.pr-locale-trigger {
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.pr-locale-arrow {
  font-size: 12px;
  transition: transform 0.2s;
}

.pr-locale-arrow.open {
  transform: rotate(180deg);
}

.pr-locale-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 120px;
  padding: 4px 0;
  background: var(--va-c-bg);
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: var(--pr-z-nav, 30);
}

.pr-locale-option {
  display: block;
  padding: 6px 16px;
  font-size: 13px;
  line-height: 20px;
  color: var(--va-c-text);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.15s;
}

.pr-locale-option:hover {
  background-color: var(--pr-c-divider-light);
}

.pr-locale-option.active {
  color: var(--pr-c-brand);
  font-weight: 600;
}
</style>
