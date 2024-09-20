<script lang="ts" setup>
import type { ValaxyAddon } from './AddonGallery.vue'

defineProps<{
  addon: ValaxyAddon
}>()

const emit = defineEmits(['tagClick'])

function handleTagClick(tag: string) {
  emit('tagClick', tag)
}
</script>

<template>
  <div
    class="transition bg-$va-c-bg-alt" border rounded-xl p-4
    dark="border-dark-200"
    hover="bg-$va-c-bg shadow-md"
  >
    <a class="text-purple-600! dark:text-purple-300! decoration-none!" mr-2 :href="addon.repo" target="_blank">
      <h3 flex="~" justify-center items-center class="my-2!" font="light">
        <div class="text-black dark:text-white" text-xl mr-1 i-ri-github-line />
        <span>{{ addon.name }}</span>
      </h3>
    </a>
    <p v-if="addon.author" class="my-2! text-sm" op="70">
      By
      <span v-for="(author, index) in addon.author" :key="index">
        <a class="text-dark-200!" :href="`https://github.com/${author}`" target="_blank">{{ author }}</a>
        <span v-if="index < addon.author.length - 1">, </span>
      </span>
    </p>
    <p class="my-1! text-xl!">
      <a mr-2 class="text-red-600!" :href="`https://npmjs.com/package/${addon.name}`" target="_blank" alt="NPM Package">
        <div i-ri-npmjs-line />
      </a>

      <!-- <a mr-2 class="text-black dark:text-white" :href="addon.repo" target="_blank" alt="GitHub Repo">
        <div i-ri-github-line />
      </a> -->
    </p>
    <div lang="en">
      <p class="text-truncate my-1!">
        {{ addon.desc }}
      </p>
    </div>
    <div lang="zh-CN">
      <p class="text-truncate my-1!">
        {{ addon.desc_zh }}
      </p>
    </div>
    <ul class="m-0! p-0! flex flex-wrap" items-center op="70">
      <span inline-flex mr-1>
        <div :class="addon.icon" />
      </span>
      <span v-for="tag, j in addon.tags" :key="j" class="break-all mr-1 cursor-pointer" @click="handleTagClick(tag)">
        #{{ tag }}
      </span>
    </ul>
  </div>
</template>
