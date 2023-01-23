<script lang="ts" setup>
import type { UseFuseOptions } from '@vueuse/integrations/useFuse'
import { useFuse } from '@vueuse/integrations/useFuse'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBodyScrollLock } from 'valaxy'
import { useRouter } from 'vue-router'

export interface FuseDataItem {
  title: string
  excerpt: string
  link: string
}

const props = defineProps<{
  open: boolean
}>()
const emit = defineEmits(['close'])

const searchContainer = ref<HTMLElement>()

const { lockBodyScroll, unlockBodyScroll } = useBodyScrollLock(searchContainer)

const { t } = useI18n()

const fuseListData = ref<any[]>([])
// const { data } = await useFetch('/fuse-list.json').get().json()
// console.log(data)

const keys = computed(() => {
  const keys = ['title', 'excerpt']
  return keys
})

const input = ref('')
// todo export options
const fuseOptions = computed<UseFuseOptions<FuseDataItem>>(() => ({
  fuseOptions: {
    keys: keys.value,
  //   isCaseSensitive: isCaseSensitive.value,
  //   threshold: exactMatch.value ? 0 : undefined,
  },
  // resultLimit: resultLimit.value,
  // matchAllWhenSearchEmpty: matchAllWhenSearchEmpty.value,
}))
const { results } = useFuse(input, fuseListData, fuseOptions)

const searchInputRef = ref<HTMLInputElement>()

watch(() => props.open, async () => {
  if (!props.open)
    return

  fetch('/fuse-list.json')
    .then(res => res.json())
    .then((data) => {
      if (Array.isArray(data))
        fuseListData.value = data as unknown as any[]

      searchInputRef.value?.focus()
    })
})

const router = useRouter()
const jumpToLink = (link: string) => {
  router.push(link)
  emit('close')
}
</script>

<template>
  <transition
    name="fade"
    @enter="lockBodyScroll"
    @after-leave="unlockBodyScroll"
  >
    <div
      v-if="open" ref="searchContainer"
      class="yun-popup yun-search-popup yun-fuse-search flex-center" flex="col"
    >
      <div class="yun-search-input-container flex-center" w="full">
        <input ref="searchInputRef" v-model="input" class="yun-search-input" :placeholder="t('search.placeholder')">
      </div>
      <div v-if="input" class="flex-center" w="full" py="4">
        {{ t('search.hits', results.length || 0) }}
      </div>
      <div overflow="auto" flex="~ 1" w="full">
        <div class="yun-fuse-result-container" flex="~ col" w="full">
          <template v-if="results.length > 0">
            <div
              v-for="result in results" :key="result.item.title"
              :to="result.item.link"
              class="yun-fuse-result-item text-$va-c-text hover:(text-$va-c-bg bg-$va-c-text-dark bg-opacity-100)"
              flex="~ col" pb-2
              @click="jumpToLink(result.item.link)"
            >
              <h3 font="serif black">
                {{ result.item.title }}
              </h3>
              <span text="sm" opacity="80">
                {{ result.item.excerpt }}
              </span>
              <span text-xs opacity-50 mt="1">
                Score Index: {{ result.refIndex }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
.yun-search-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);

  text-align: center;
  padding-top: 3.5rem;
  margin: 0;
  z-index: var(--yun-z-search-popup);
  transition: 0.6s;

  background-color: var(--va-c-bg-opacity);
}

.yun-search-input {
  background: transparent;
  color: var(--va-c-text);
  font-size: 1.5rem;
  border-radius: 3rem;
  padding: 1rem 1.5rem;
  border: 1px solid var(--va-c-gray);
  box-sizing: border-box;
  width: 90%;
  max-width: 800px;
  font-family: var(--va-font-serif);
  font-weight: 900;
  text-align: center;
  transition: all 0.2s;

  &:focus {
    border-color: var(--va-c-text);
  }
}

.yun-popup {
  .search-icon, .close-icon {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    padding: 0.5rem;

    .icon {
      width: 2rem;
      height: 2rem;
    }
  }
}

.yun-fuse-search {
  .yun-fuse-result-item {
    // padding: 0.5rem;
    cursor: pointer;

    border-top: 1px dashed #ccc;
  }
}
</style>
