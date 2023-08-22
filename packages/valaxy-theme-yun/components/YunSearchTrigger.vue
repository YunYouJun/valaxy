<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useMagicKeys } from '@vueuse/core'

const siteConfig = useSiteConfig()

const isAlgolia = computed(() => siteConfig.value.search.type === 'algolia')
const isFuse = computed(() => siteConfig.value.search.type === 'fuse')

const open = ref(false)

function togglePopup() {
  open.value = !open.value
}

const { Meta_K } = useMagicKeys()

watch(Meta_K, (val) => {
  if (val)
    togglePopup()
})

const YunAlgoliaSearch = isAlgolia.value
  ? defineAsyncComponent(() => import('./third/YunAlgoliaSearch.vue'))
  : () => null
</script>

<template>
  <YunSearchBtn :open="open && !isAlgolia" @click="togglePopup" />

  <YunAlgoliaSearch v-if="isAlgolia" :open="open" @close="open = false" />
  <YunFuseSearch v-else-if="isFuse" :open="open" @close="open = false" />
</template>
