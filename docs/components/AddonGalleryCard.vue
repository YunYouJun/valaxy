<script lang="ts" setup>
import type { ValaxyAddon } from './AddonGallery.vue'

defineProps<{
  addon: ValaxyAddon
}>()
</script>

<template>
  <div
    class="transition bg-$va-c-bg-alt" border rounded-xl p-4
    dark="border-dark-200"
    hover="bg-$va-c-bg shadow-md"
  >
    <a class="text-purple-600 dark:text-purple-300" mr-2 :href="addon.repo" target="_blank">
      <h3 flex="~" justify-center items-center my-2 font="light">
        <div class="text-black dark:text-white" text-xl mr-1 i-ri-github-line />
        <span>{{ addon.name }}</span>
      </h3>
    </a>
    <p my-1 text-xl>
      <a mr-2 class="text-red-600" :href="`https://npmjs.com/package/${addon.name}`" target="_blank" alt="NPM Package">
        <div i-ri-npmjs-line />
      </a>

      <!-- <a mr-2 class="text-black dark:text-white" :href="addon.repo" target="_blank" alt="GitHub Repo">
        <div i-ri-github-line />
      </a> -->
    </p>
    <p my-1 class="text-truncate">
      {{ addon.desc }}
    </p>
    <ul class=" m-0 p-0 flex flex-wrap" items-center op="70">
      <span inline-flex mr-1>
        <div :class="addon.icon" />
      </span>
      <span v-for="tag, j in addon.tags" :key="j" class="break-all mr-1">
        #{{ tag }}
      </span>
    </ul>
  </div>
</template>
