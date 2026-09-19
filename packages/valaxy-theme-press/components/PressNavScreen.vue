<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  open: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div v-show="open" id="pr-NavScreen" class="pr-NavScreen" :inert="!open">
    <div class="screen-content">
      <p class="screen-heading">
        {{ t('nav.site') }}
      </p>
      <slot name="nav-screen-content-before" />
      <PressNavScreenMenu class="menu" />
      <div class="screen-preferences">
        <PressNavScreenTranslations class="translations" />
        <PressNavScreenAppearance class="appearance" />
      </div>
      <PressNavScreenSocialLinks class="social-links" />
      <slot name="nav-screen-content-after" />
    </div>
  </div>
</template>

<style scoped>
/* stylelint-disable selector-class-pattern */
.pr-NavScreen {
  position: fixed;
  inset: var(--pr-nav-height) 0 0;
  z-index: var(--pr-z-nav-screen);
  padding: 0 max(24px, env(safe-area-inset-right)) 0 max(24px, env(safe-area-inset-left));
  overflow-y: auto;
  overscroll-behavior: contain;
  background-color: var(--pr-c-bg);
}

.screen-content {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 20px 0 max(24px, env(safe-area-inset-bottom));
  max-width: 560px;
}

.screen-heading {
  margin: 0;
  padding-bottom: 12px;
  color: var(--pr-c-text-2);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.screen-preferences {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: 24px;
}

.translations {
  flex-shrink: 0;
  min-width: 52px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 12px;
  background-color: var(--va-c-bg-soft);
}

.translations :deep(button) {
  justify-content: center;
  width: 100%;
  min-height: 48px;
}

.appearance { min-width: 0; }
.social-links { margin-top: 20px; }

@media (width >= 1024px) {
  .pr-NavScreen { display: none; }
}
</style>
