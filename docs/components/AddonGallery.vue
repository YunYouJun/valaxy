<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ValaxyAddon {
  icon: string
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
  <div class="relative my-4 flex-center" flex="~" rounded>
    <div class="i-ri-search-line absolute text-slate-400 left-0 pl-12" />
    <input
      v-model="keyword"
      :placeholder="t('gallery.tip')"
      pl-10 pr-4
      class="focus:border-purple-500 b-2 w-full h-12"
      dark="border-dark-200"
      bg="bg-white dark:bg-dark-500"
      rounded-lg transition
      type="text" name="search"
    >
  </div>
  <ul class="m-0 p-0 sm:grid-cols-1 lg:grid-cols-2 grid" gap="4">
    <li v-for="addon, i in filteredAddons" :key="i" class="w-full list-none">
      <AddonGalleryCard :addon="addon" />
    </li>
  </ul>
</template>
