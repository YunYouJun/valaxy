<script setup lang="ts">
import { NavigationMenuList } from 'reka-ui'
import { useI18n } from 'vue-i18n'
import { useLocaleConfig } from '../composables'
import PressMenuLink from './PressMenuLink.vue'
import PressNavItemGroup from './PressNavItemGroup.vue'
import PressToggleLocale from './PressToggleLocale.vue'

const { t } = useI18n()
const { hasLocales, availableLocales, currentLocale, currentLocaleKey, getLocalePath, selectLocale } = useLocaleConfig()
</script>

<template>
  <div class="pr-nav-bar-translations" h="full">
    <div v-if="hasLocales" class="flex" h="full">
      <NavigationMenuList class="pr-nav-bar-menu-list">
        <PressNavItemGroup :item="{ items: [] }" :aria-label="t('button.toggle_langs')">
          <template #trigger>
            <div i-ri-translate />
          </template>
          <div class="press-locale-menu-label">
            {{ currentLocale.label }}
          </div>
          <template v-for="loc in availableLocales" :key="loc.key">
            <PressMenuLink
              v-if="loc.key !== currentLocaleKey"
              :item="{ text: loc.label, link: getLocalePath(loc.key) }"
              @click="selectLocale(loc.key)"
            />
          </template>
        </PressNavItemGroup>
      </NavigationMenuList>
    </div>
    <PressToggleLocale v-else />
  </div>
</template>

<style scoped>
.pr-nav-bar-translations {
  display: none;
}

@media (width >= 1024px) {
  .pr-nav-bar-translations {
    display: flex;
    align-items: center;
  }
}
</style>
