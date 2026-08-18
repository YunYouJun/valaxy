<script lang="ts" setup>
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'
import { useLocale } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useLocaleConfig } from '../composables'

const { t, locale } = useI18n()
const { toggleLocales } = useLocale()
const { hasLocales, availableLocales, currentLocale, currentLocaleKey, getLocalePath } = useLocaleConfig()
</script>

<template>
  <DropdownMenuRoot v-if="hasLocales" :modal="false">
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="press-locale-trigger flex items-center bg-transparent"
        h="full"
        :aria-label="t('button.toggle_langs')"
        :title="t('button.toggle_langs')"
      >
        <div i-ri-translate />
        <div i-ri-arrow-drop-down-line />
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="press-locale-menu-content"
        align="center"
        :side-offset="8"
      >
        <DropdownMenuLabel class="press-locale-menu-label">
          {{ currentLocale.label }}
        </DropdownMenuLabel>
        <template v-for="loc in availableLocales" :key="loc.key">
          <DropdownMenuItem
            v-if="loc.key !== currentLocaleKey"
            class="press-locale-menu-item"
            as-child
          >
            <AppLink
              class="press-locale-menu-link"
              p="x-3"
              :to="getLocalePath(loc.key)"
            >
              {{ loc.label }}
            </AppLink>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>

  <!-- Legacy toggle mode: no locales config -->
  <button
    v-else
    class="press-locale-trigger"
    :aria-label="t('button.toggle_langs')"
    :title="t('button.toggle_langs')"
    @click="toggleLocales"
  >
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </button>
</template>

<style lang="scss">
.press-locale-trigger {
  color: var(--pr-nav-text);
  font-weight: 500;
  font-size: 14px;
}

.press-locale-trigger[data-state="open"] {
  color: rgb(60 60 60 / 0.70);
  transition: color var(--va-transition-duration);

  .dark & {
    color: rgb(235 235 235 / 0.6)
  }
}

.press-locale-menu-content {
  z-index: calc(var(--pr-z-nav) + 1);
  min-width: 128px;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgb(60 60 60 / 0.12);
  background-color: #fff;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.1), 0 2px 6px rgb(0 0 0 / 0.08);
}

.dark .press-locale-menu-content {
  background-color: #242424;
}

.press-locale-menu-label {
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: rgb(60 60 60 / 0.5);
  line-height: 28px;
  white-space: nowrap;
  text-transform: uppercase;
}

.dark .press-locale-menu-label {
  color: rgb(235 235 235 / 0.5);
}

.press-locale-menu-item {
  border-radius: 6px;
}

.press-locale-menu-link {
  display: flex;
  width: 100%;
  border-radius: 6px;
  color: var(--pr-nav-text);
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition:
    background-color var(--va-transition-duration),
    color var(--va-transition-duration);
}

.press-locale-menu-item[data-highlighted] .press-locale-menu-link {
  background-color: #f1f1f1;
  color: var(--va-c-brand);
}

.dark .press-locale-menu-item[data-highlighted] .press-locale-menu-link {
  background-color: #2f2f2f;
}
</style>
