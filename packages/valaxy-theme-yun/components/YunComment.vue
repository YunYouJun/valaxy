<script lang="ts" setup>
import { useRuntimeConfig } from 'valaxy'
import { computed, ref } from 'vue'

const runtimeConfig = useRuntimeConfig()
const supportCommentAddons = ['valaxy-addon-waline', 'valaxy-addon-twikoo']

const commentSystems = computed(() => {
  return supportCommentAddons.filter(addonName => runtimeConfig.value.addons[addonName]).map(addonName => addonName.split('-')[2])
})

const activeComment = ref(commentSystems.value[0])
</script>

<template>
  <YunCard w="full" p="4" class="comment yun-comment sm:p-6 lg:px-12 xl:px-16">
    <ClientOnly>
      <div v-if="commentSystems.length > 1" class="flex justify-end w-full mb-2">
        <YunSelect v-model="activeComment" :options="commentSystems" />
      </div>
      <YunWaline v-if="activeComment === 'waline'" />
      <YunTwikoo v-if="activeComment === 'twikoo'" />
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
