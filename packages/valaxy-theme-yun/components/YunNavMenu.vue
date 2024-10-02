<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useYunAppStore } from '../stores'

const yunApp = useYunAppStore()
const siteConfig = useSiteConfig()

const showMenu = ref(false)
const route = useRoute()
onMounted(() => {
  if (route.meta.layout === 'home') {
    setTimeout(() => {
      showMenu.value = true
    }, 600)
  }
  else {
    showMenu.value = true
  }
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="showMenu"
      class="yun-nav-menu shadow-xl"
      border="~ solid $va-c-text"
    >
      <!--  -->
      <ValaxyHamburger
        :active="yunApp.fullscreenMenu.isOpen"
        class="menu-btn sidebar-toggle leading-4 size-12 bg-$va-c-bg"
        inline-flex cursor="pointer"
        hover="bg-$va-c-bg-soft"
        z="$yun-z-menu-btn"
        @click="yunApp.fullscreenMenu.toggle()"
      />
      <NavMenuTitle />
      <YunSearchTrigger v-if="siteConfig.search.enable" />
    </div>
  </Transition>
</template>

<style lang="scss">
@use "valaxy/client/styles/mixins/index.scss" as *;

.yun-nav-menu {
  position: fixed;
  animation: nav-menu-appear 0.3s linear forwards;
  animation-timeline: scroll();
  animation-range: 0 calc(30vh);
  z-index: var(--yun-z-menu-btn);
  display: flex;
  top: var(--rect-margin);
  left: var(--rect-margin);
  right: var(--rect-margin);
  align-items: center;
  justify-content: space-between;
  height: 50px;

  .vt-hamburger-top, .vt-hamburger-middle, .vt-hamburger-bottom {
    background-color: var(--va-c-text);
  }
}

@keyframes nav-menu-appear {
  from {
    top: var(--rect-margin);
    left: var(--rect-margin);
    right: var(--rect-margin);
    background-color: transparent;
    box-shadow: none;
  }

  to {
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--va-c-bg);
    border-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
