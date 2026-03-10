<script lang="ts" setup>
import { useLocale } from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleConfig } from '../composables'

const { t, locale } = useI18n()
const { toggleLocales } = useLocale()
const { hasLocales, availableLocales, currentLocale, currentLocaleKey, getLocalePath } = useLocaleConfig()

const open = ref(false)
</script>

<template>
  <!-- Flyout mode: reuse PressNavItemGroup dropdown pattern -->
  <div
    v-if="hasLocales"
    class="flex relative group"
    h="full"
    :aria-expanded="open"
    aria-haspopup="true"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <button
      type="button"
      class="button flex items-center bg-transparent"
      h="full"
      :title="t('button.toggle_langs')"
      @click="open = !open"
    >
      <div i-ri-translate />
      <div i-ri-arrow-drop-down-line />
    </button>

    <div class="menu grow" flex="~ col" items="start">
      <p class="menu-title">
        {{ currentLocale.label }}
      </p>
      <template v-for="loc in availableLocales" :key="loc.key">
        <div v-if="loc.key !== currentLocaleKey" class="menu-link w-full">
          <AppLink
            class="menu-item"
            p="x-3"
            :to="getLocalePath(loc.key)"
          >
            {{ loc.label }}
          </AppLink>
        </div>
      </template>
    </div>
  </div>

  <!-- Legacy toggle mode: no locales config -->
  <button v-else :title="t('button.toggle_langs')" @click="toggleLocales">
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </button>
</template>

<style lang="scss" scoped>
.group .button {
  color: var(--pr-nav-text);
  font-weight: 500;
  font-size: 14px;
}

.group[aria-expanded="true"] .button {
  color: rgb(60 60 60 / 0.70);
  transition: color 0.25s;

  .dark & {
    color: rgb(235 235 235 / 0.6)
  }
}

.menu {
  position: absolute;
  top: 20px;
  left: 50%;
  min-width: 128px;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.25s,
    visibility 0.25s,
    transform 0.25s;
  transform: translateX(-50%) translateY(calc(var(--pr-nav-height) / 2));
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgb(60 60 60 / 0.12);
  background-color: #fff;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.1), 0 2px 6px rgb(0 0 0 / 0.08);

  .dark & {
    background-color: #242424;
  }
}

.group[aria-expanded="true"] > .menu {
  opacity: 1;
  visibility: visible;
}

.menu-title {
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: rgb(60 60 60 / 0.5);
  line-height: 28px;
  white-space: nowrap;
  text-transform: uppercase;

  .dark & {
    color: rgb(235 235 235 / 0.5);
  }
}

.menu-link {
  .menu-item {
    display: flex;
    width: 100%;
    border-radius: 6px;
    color: var(--pr-nav-text);
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      background-color 0.25s,
      color 0.25s;

    &:hover {
      background-color: #f1f1f1;
      color: var(--va-c-brand);

      .dark & {
        background-color: #2f2f2f;
      }
    }

}
}
</style>
