<script setup lang="ts">
import { useFrontmatter, useSiteConfig } from 'valaxy'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useYunAppStore } from '../../stores'

const yunApp = useYunAppStore()
const fm = useFrontmatter()
const siteConfig = useSiteConfig()

const showPostTitle = ref(false)
watch(() => yunApp.scrollY, () => {
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
    flex="~ col h-full"
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
    <span
      v-if="fm.title && showPostTitle"
      class="nav-menu-post-title text-sm font-bold flex items-center gap-1 truncate"
    >
      <div
        class="size-4"
        :class="fm.icon || 'i-ri-article-line'"
      />
      <span> {{ fm.title }}</span>
    </span>
    <span v-else class="font-light truncate">
      {{ siteConfig.title }}
    </span>
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
