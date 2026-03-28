<script lang="ts" setup>
import { isClient, useScrollLock } from '@vueuse/core'
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
}>()
const emit = defineEmits(['close'])

const isLocked = useScrollLock(isClient ? document.documentElement : null)
const { t } = useI18n()

const searchInputRef = ref<HTMLInputElement>()

watch(() => props.open, (val) => {
  if (val) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
})
</script>

<template>
  <Transition
    name="fade"
    @enter="isLocked = true"
    @after-leave="isLocked = false"
  >
    <div
      v-if="open"
      class="yun-popup yun-search-popup yun-local-search flex-center pointer-events-auto" flex="col"
      justify="start"
      pt-12
    >
      <ValaxyLocalSearch :open="open" @close="emit('close')">
        <template #default="{ query, results, loading, selectedIndex, updateQuery, navigate, onKeydown, getPageTitle, getSectionTitle }">
          <div class="yun-search-input-container flex-center" w="full">
            <input
              ref="searchInputRef"
              :value="query"
              class="yun-search-input"
              :placeholder="t('search.placeholder')"
              @input="updateQuery(($event.target as HTMLInputElement).value)"
              @keydown="onKeydown"
            >
          </div>
          <div v-if="loading" class="flex-center" w="full" py="4">
            {{ t('search.loading') }}
          </div>
          <div v-if="query" class="flex-center" w="full" py="4">
            {{ t('search.hits', results.length || 0) }}
          </div>
          <div v-if="results.length > 0" overflow="auto" flex="~" w="full" class="justify-center">
            <div class="yun-local-result-container max-w-3xl" flex="~ col" w="full">
              <a
                v-for="(result, index) in results" :key="result.id"
                class="yun-local-result-item text-left p-2 cursor-pointer"
                :class="{ 'yun-local-result-active': index === selectedIndex }"
                href="javascript:void(0)"
                @click="navigate(result)"
              >
                <div class="yun-local-result-titles" text="xs" font="light" opacity="60">
                  {{ getPageTitle(result.id) }}
                  <template v-if="result.titles.length > 0">
                    <span v-for="(title, i) in result.titles" :key="i">
                      &rsaquo; {{ title }}
                    </span>
                  </template>
                </div>
                <h3 font="medium">
                  {{ result.title }}
                </h3>
                <div class="flex justify-between op-50" text-xs mt="1" font="light">
                  <span>{{ getSectionTitle(result) }}</span>
                  <span flex="~ gap-1">
                    <span>Score:</span>
                    <div class="text-right w-8">{{ result.score.toFixed(1) }}</div>
                  </span>
                </div>
              </a>

              <div class="flex op-30 justify-end text-xs p-4">
                Search by MiniSearch
              </div>
            </div>
          </div>
        </template>
      </ValaxyLocalSearch>
    </div>
  </Transition>
</template>

<style lang="scss">
.yun-local-search {
  .yun-local-result-item {
    cursor: pointer;
    border-top: 1px dashed #ccc;
    color: var(--va-c-text);

    &:hover,
    &.yun-local-result-active {
      color: var(--va-c-bg);
      background-color: var(--va-c-text-dark);
    }
  }

  .yun-local-result-titles {
    margin-bottom: 0.25rem;
  }
}
</style>
