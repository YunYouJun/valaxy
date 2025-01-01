<script lang="ts" setup>
import { isClient, onClickOutside, useScrollLock } from '@vueuse/core'
import { useFuseSearch } from 'valaxy'
import { ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
}>()
const emit = defineEmits(['close'])

const input = ref('')

const isLocked = useScrollLock(isClient ? document.documentElement : null)
const { t } = useI18n()
const { results, fetchFuseListData } = useFuseSearch(input)

const searchInputRef = ref<HTMLInputElement>()
const searchContainer = ref<HTMLElement>()

onClickOutside(searchInputRef, () => {
  // emit('close')
})

watch(() => props.open, () => {
  if (props.open)
    fetchFuseListData()
})
</script>

<template>
  <Transition
    name="fade"
    @enter="isLocked = true"
    @after-leave="isLocked = false"
  >
    <div
      v-if="open" ref="searchContainer"
      class="yun-popup yun-search-popup yun-fuse-search flex-center pointer-events-auto" flex="col"
      justify="start"
      pt-12
    >
      <div class="yun-search-input-container flex-center" w="full">
        <input ref="searchInputRef" v-model="input" class="yun-search-input" :placeholder="t('search.placeholder')">
      </div>
      <div v-if="input" class="flex-center" w="full" py="4">
        {{ t('search.hits', results.length || 0) }}
      </div>
      <div v-if="results.length > 0" overflow="auto" flex="~" w="full" class="justify-center">
        <div class="yun-fuse-result-container max-w-3xl" flex="~ col" w="full">
          <AppLink
            v-for="result in results" :key="result.item.title"
            :to="result.item.link"
            class="yun-fuse-result-item text-$va-c-text hover:(text-$va-c-bg bg-$va-c-text-dark bg-opacity-100) text-left p-2"
            flex="~ col"
            @click="emit('close')"
          >
            <h3 font="medium">
              {{ result.item.title }}
            </h3>
            <span text="sm" font="light" opacity="80">
              {{ result.item.excerpt }}
            </span>
            <div class="flex justify-between op-50" text-xs mt="1" font="light">
              <span>
                {{ result.item.link }}
              </span>
              <span flex="~ gap-1">
                <span>Score Index:</span>
                <div class="text-right w-4">{{ result.refIndex }}</div>
              </span>
            </div>
          </AppLink>

          <div class="flex op-30 justify-end text-xs p-4">
            Search by Local
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.yun-search-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(30px);
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-backdrop-filter: blur(30px);
  text-align: center;
  margin: 0;
  z-index: var(--yun-z-search-popup);
  transition: 0.2s;
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
