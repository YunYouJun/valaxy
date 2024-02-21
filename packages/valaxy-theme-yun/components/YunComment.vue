<script lang="ts" setup>
import { useRuntimeConfig } from 'valaxy'
import { ref } from 'vue'

const activeComment = ref<'waline' | 'twikoo'>('waline')
const runtimeConfig = useRuntimeConfig()
const isDoubleComment = !!(runtimeConfig.value.addons['valaxy-addon-waline'] && runtimeConfig.value.addons['valaxy-addon-twikoo']) as boolean

function toggleComment() {
  activeComment.value = activeComment.value === 'waline' ? 'twikoo' : 'waline'
}
</script>

<template>
  <YunCard w="full" p="4" class="comment yun-comment sm:p-6 lg:px-12 xl:px-16">
    <ClientOnly>
      <div v-if="isDoubleComment" class="flex justify-end w-full pr-4 mb-2">
        <div class="flex gap-x-2 items-center px-4 py-2 rounded-2 bg-[var(--va-c-bg-dark)] text-sm">
          <div class="text-[var(--va-c-primary-lighter)]">
            Waline
          </div>
          <button class="relative w-12 h-6 rounded-full cursor-pointer bg-[var(--va-c-primary-light)]" @click="toggleComment">
            <div class="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition" :class="activeComment === 'twikoo' ? 'translate-x-6' : 'translate-x-0'" />
          </button>
          <div class="text-[var(--va-c-red-3)]">
            Twikoo
          </div>
        </div>
      </div>
      <YunWaline v-if="isDoubleComment ? activeComment === 'waline' : runtimeConfig.addons['valaxy-addon-waline']" />
      <YunTwikoo v-if="isDoubleComment ? activeComment === 'twikoo' : runtimeConfig.addons['valaxy-addon-twikoo']" />
      <slot />
    </ClientOnly>
  </YunCard>
</template>

<style lang="scss">
.comment {
  h1 {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h5 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  h6 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  ul {
    list-style: disc;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }

  ol {
    list-style: decimal;
    margin-left: 1rem;
    margin-bottom: 1rem;
  }
}
</style>
