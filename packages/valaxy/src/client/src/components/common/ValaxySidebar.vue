<template>
  <ValaxyOverlay :show="active" @click="active = !active" />

  <ValaxyHamburger id="menu-btn" :active="active" class="sidebar-toggle yun-icon-btn" @click="active = !active" />

  <aside :class="['sidebar', active && 'open']">
    <ul class="sidebar-nav">
      <li class="sidebar-nav-item" />
    </ul>

    <button class="icon-btn mx-2 !outline-none" :title="t('button.toggle_dark')" @click="toggleDark()">
      <div i="carbon-sun dark:carbon-moon" />
      todo dark
    </button>

    <nav text-xl mt-6>
      <router-link class="icon-btn mx-2" to="/" :title="t('button.home')">
        <div i-carbon-campsite />
      </router-link>

      <button class="icon-btn mx-2 !outline-none" :title="t('button.toggle_dark')" @click="toggleDark()">
        <div i="carbon-sun dark:carbon-moon" />
      </button>

      <a class="icon-btn mx-2" :title="t('button.toggle_langs')" @click="toggleLocales">
        <div i-carbon-language />
      </a>

      <router-link class="icon-btn mx-2" to="/about" :title="t('button.about')">
        <div i-carbon-dicom-overlay />
      </router-link>
    </nav>
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { useI18n } from 'vue-i18n'
import { toggleDark } from '~/composables'

const props = withDefaults(defineProps<{
  open: boolean
}>(), {
  open: false,
})

const active = ref(props.open)

const { t, availableLocales, locale } = useI18n()

const toggleLocales = () => {
  // change to some real logic
  const locales = availableLocales
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
}
</script>

<style lang="scss">
@use "sass:map";

@use "~/styles/vars" as *;

#menu-btn {
  display: inline-flex;
  position: fixed;
  left: 0.8rem;
  top: 0.6rem;
  line-height: 1;
  z-index: map.get($z-index, 'menu-btn');
  cursor: pointer;
}
</style>
