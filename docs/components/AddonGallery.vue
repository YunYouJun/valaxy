<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ValaxyAddon {
  icon: string
  name: string
  author: string | string[]
  repo: string
  desc: string
  desc_zh: string
  siteImage?: string
  siteExampleUrl?: string
  tags?: string[]
}

export interface NormalizedValaxyAddon extends Omit<ValaxyAddon, 'author'> {
  author: string[]
}

const props = withDefaults(defineProps<{
  addons: ValaxyAddon[]
}>(), {})

const { t } = useI18n()
const keyword = shallowRef('')
const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())

const normalizedAddons = computed<NormalizedValaxyAddon[]>(() => {
  return props.addons.map((item) => {
    return {
      ...item,
      author: Array.isArray(item.author) ? item.author : [item.author],
    }
  })
})

const filteredAddons = computed(() => {
  const query = normalizedKeyword.value

  if (!query)
    return normalizedAddons.value

  return normalizedAddons.value.filter((item) => {
    return item.name.toLowerCase().includes(query)
      || item.desc.toLowerCase().includes(query)
      || item.desc_zh.includes(query)
      || item.author.some(author => author.toLowerCase().includes(query))
      || item.tags?.some(tag => tag.toLowerCase().includes(query))
  })
})

function handleTagClick(tag: string) {
  keyword.value = tag
}
</script>

<template>
  <div class="addon-gallery-search relative my-5">
    <div class="i-ri-search-line pointer-events-none absolute left-4 top-1/2 text-slate-400 -translate-y-1/2" />
    <input
      v-model="keyword"
      :placeholder="t('gallery.tip')"
      class="addon-gallery-search-input w-full"
      type="text" name="search"
    >
  </div>
  <ul class="m-0! p-0! grid grid-cols-1 lg:grid-cols-2" gap="5">
    <li v-for="addon in filteredAddons" :key="addon.name" class="w-full list-none m-0!">
      <AddonGalleryCard :addon="addon" @tag-click="handleTagClick" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
.addon-gallery-search-input {
  height: 3rem;
  padding: 0 1rem 0 2.75rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.75rem;
  outline: none;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

  &:focus {
    border-color: var(--va-c-primary);
    box-shadow: 0 0 0 3px rgb(var(--va-c-primary-rgb), 0.16);
    background: var(--va-c-bg);
  }
}
</style>
