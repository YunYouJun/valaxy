<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ValaxyAddon {
  name: string
  repo: string
  desc: string
  siteImage: string
  siteExampleURL?: string
  tags?: string[]
}

const props = withDefaults(defineProps<{
  addons: ValaxyAddon[]
}>(), {})

const { t } = useI18n()
const keyword = ref('')
const filteredAddons = computed(() => {
  return props.addons.filter((item) => {
    return item.name.includes(keyword.value) || item.tags?.some(t => t.includes(keyword.value))
  })
})
</script>

<template>
  <div class="relative mx-1 my-4 flex-center border border-slate-300" flex="~" rounded>
    <div class="i-ri-search-line absolute text-slate-400 left-0 pl-12" />
    <input
      v-model="keyword"
      :placeholder="t('gallery.tip')"
      class="placeholder:text-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1
      b-2 w-full h-12"
      rounded
      pl-10 pr-4
      type="text" name="search"
    >
  </div>
  <ul class="m-0 p-0 sm:grid-cols-1 lg:grid-cols-2 grid">
    <li v-for="addon, i in filteredAddons" :key="i" class="w-full lg:p-4 sm:pb-4 list-none">
      <a mr-2 :href="addon.repo" target="_blank">
        <h3 flex="~" justify-center items-center>
          <div text-xl mr-1 i-ri-github-line />
          <span>{{ addon.name }}</span>
        </h3>
      </a>
      <div text-xl>
        <a mr-2 class="text-red-600" :href="`https://npmjs.com/package/${addon.name}`" target="_blank" alt="NPM Package">
          <div i-ri-npmjs-line />
        </a>
      </div>
      <p m-1>
        {{ addon.desc }}
      </p>
      <ul class=" m-0 p-0 flex flex-wrap">
        <span v-for="tag, j in addon.tags" :key="j" class="break-all text-gray mr-6px">
          #{{ tag }}
        </span>
      </ul>
    </li>
  </ul>
</template>
