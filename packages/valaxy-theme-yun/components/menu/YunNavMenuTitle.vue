<script setup lang="ts">
import { useFrontmatter, useSiteConfig } from 'valaxy'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useYunAppStore } from '../../stores'

const yunApp = useYunAppStore()
const fm = useFrontmatter()
const siteConfig = useSiteConfig()

const route = useRoute()
const showPostTitle = ref(false)
const showSiteTitle = computed(() => {
  if (yunApp.isStrato)
    return route.path === '/' ? false : yunApp.scrollY < 10
  return !showPostTitle.value
})
watch(() => yunApp.scrollY, () => {
  if (yunApp.isNimbo)
    showPostTitle.value = yunApp.scrollY > 200
})

const router = useRouter()
function goToLink() {
  if (!showPostTitle.value)
    router.push('/')
}
</script>

<template>
  <div
    v-motion
    flex="~ center col h-full"
    :class="{
      'cursor-pointer': !showPostTitle,
    }"
    :initial="{
      opacity: 0,
      y: 10,
    }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: {
        duration: 400,
        delay: 1200,
      },
    }"
    @click="goToLink"
  >
    <div
      v-if="fm.title && showPostTitle"
      flex="~ col"
      class="nav-menu-post-title text-xs font-bold flex items-center gap-1 lt-sm:max-w-40"
    >
      <div class="gap-1" flex="~">
        <div
          class="size-4"
          :class="fm.icon || 'i-ri-article-line'"
        />
        <span class="truncate"> {{ fm.title }}</span>
      </div>
      <span v-if="fm.subtitle" class="font-light op-80">
        {{ fm.subtitle }}
      </span>
    </div>
    <Transition>
      <span v-if="showSiteTitle" class="font-light truncate">
        {{ siteConfig.title }}
      </span>
    </Transition>
  </div>
</template>

<style lang="scss">
.nav-menu-post-title {
  // safari not support
  animation: nav-menu-title-appear 0.3s linear forwards;

  // animation-timeline: scroll();
  // animation-range: 0 calc(30vh);
}

@keyframes nav-menu-title-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
