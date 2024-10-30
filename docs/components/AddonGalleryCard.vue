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
    class="bg-purple-50/50 dark:bg-$va-c-bg-alt justify-center items-start gap-2 transition"
    border rounded-xl p-4
    dark="border-dark-200"
    hover="bg-purple-100 dark:bg-$va-c-bg shadow-lg"
    flex="~ col"
  >
    <a class="text-purple-600! dark:text-purple-300! decoration-none!" mr-2 :href="addon.repo" target="_blank">
      <h3 flex="~" justify-center items-center class="my-2!" font="light">
        <div class="text-black dark:text-white" text-xl mr-1 i-ri-github-line />
        <span>{{ addon.name }}</span>
      </h3>
    </a>
    <div
      flex="~"
      class="text-sm items-center gap-1"
      op="70"
    >
      <a class="text-red-600!" :href="`https://npmjs.com/package/${addon.name}`" target="_blank" alt="NPM Package">
        <div i-ri-npmjs-line />
      </a>
      <template v-if="addon.author">
        <span>By</span>
        <span v-for="(author, index) in addon.author" :key="index">
          <a
            class="text-dark-200 dark:text-white"
            :href="`https://github.com/${author}`"
            target="_blank"
          >{{ author }}</a>
          <span v-if="index < addon.author.length - 1">, </span>
        </span>
      </template>
    </div>

    <div class="w-full" lang="en">
      <div class="text-truncate text-xs" :title="addon.desc_zh">
        {{ addon.desc }}
      </div>
    </div>
    <div class="w-full" lang="zh-CN">
      <div class="text-truncate text-xs" :title="addon.desc_zh">
        {{ addon.desc_zh }}
      </div>
    </div>
    <ul class="m-0! p-0! gap-2" flex="~ wrap" items-center op="70">
      <span inline-flex>
        <div :class="addon.icon" />
      </span>
      <div flex="~" class="gap-2">
        <span
          v-for="tag, j in addon.tags" :key="j"
          class="break-all cursor-pointer text-xs"
          @click="handleTagClick(tag)"
        >
          #{{ tag }}
        </span>
      </div>
    </ul>
  </div>
</template>
