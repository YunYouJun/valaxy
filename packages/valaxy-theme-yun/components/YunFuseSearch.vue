<script lang="ts" setup>
import { useResizeObserver, useScroll } from '@vueuse/core'
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, VisuallyHidden } from 'reka-ui'
import { useFuseSearch } from 'valaxy'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { t, locale } = useI18n()
const zh = computed(() => locale.value.startsWith('zh'))
const input = shallowRef('')
const query = computed(() => input.value.trim())
const { results, fetchFuseListData } = useFuseSearch(query)
const dialog = shallowRef<HTMLElement>()
const searchInput = shallowRef<HTMLInputElement>()
const resultsContainer = shallowRef<HTMLElement>()
const { arrivedState, measure } = useScroll(resultsContainer, { offset: { bottom: 1 } })
useResizeObserver(resultsContainer, measure)
watch(results, () => nextTick(measure), { flush: 'post' })
const activeIndex = shallowRef(0)
const loading = shallowRef(false)
const failed = shallowRef(false)
let loaded = false

async function load() {
  if (loaded || loading.value)
    return
  loading.value = true
  failed.value = false
  try {
    await fetchFuseListData()
    loaded = true
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

watch(() => props.open, (open) => {
  if (open)
    void load()
}, { immediate: true })
watch(query, () => {
  activeIndex.value = 0
})
function onKeydown(event: KeyboardEvent) {
  if (event.isComposing || !results.value.length)
    return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + results.value.length) % results.value.length
    nextTick(() => dialog.value?.querySelectorAll<HTMLElement>('.yun-search-result')[activeIndex.value]?.focus())
  }
  else if (event.key === 'Enter' && event.target === searchInput.value) {
    event.preventDefault()
    dialog.value?.querySelectorAll<HTMLElement>('.yun-search-result')[activeIndex.value]?.click()
  }
}

function onBackdrop(event: MouseEvent) {
  if (event.target !== dialog.value)
    return
  emit('close')
}

function excerpt(text: string = '') {
  return text.replace(/<!--[\s\S]*?(?:-->|$)/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, '').replace(/[#*>`_]/g, '').replace(/\s+/g, ' ').trim().slice(0, 180)
}
</script>

<template>
  <DialogRoot :open="open" @update:open="value => !value && emit('close')">
    <DialogPortal to="#valaxy-teleports">
      <DialogOverlay class="yun-search-backdrop" />
      <DialogContent as-child @open-auto-focus.prevent="searchInput?.focus()">
        <div ref="dialog" class="yun-fuse-dialog" @click="onBackdrop" @keydown="onKeydown">
          <VisuallyHidden as-child>
            <DialogTitle>{{ zh ? '搜索文章' : 'Search articles' }}</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden as-child>
            <DialogDescription>{{ zh ? '搜索标题、正文或标签，使用方向键选择结果，按 Enter 打开。' : 'Search titles, content, or tags. Use arrow keys to select and Enter to open.' }}</DialogDescription>
          </VisuallyHidden>
          <div class="yun-search-field">
            <span class="i-ri-search-line" aria-hidden="true" />
            <input
              ref="searchInput" v-model="input" type="search" autocomplete="off"
              :placeholder="zh ? '搜索文章…' : 'Search articles…'" :aria-label="zh ? '搜索文章' : 'Search articles'"
            >
            <DialogClose class="yun-search-dismiss yun-icon-btn yun-search-action" :aria-label="zh ? '关闭搜索' : 'Close search'">
              <div class="i-ri-close-line" aria-hidden="true" />
            </DialogClose>
          </div>
          <div class="yun-search-status" role="status" aria-live="polite">
            <template v-if="loading">
              {{ zh ? '正在加载文章…' : 'Loading articles…' }}
            </template>
            <template v-else-if="failed">
              {{ zh ? '文章加载失败。' : 'Unable to load articles.' }}
              <button type="button" @click="load">
                {{ zh ? '重试' : 'Retry' }}
              </button>
            </template>
            <template v-else-if="query">
              {{ t('search.hits', results.length) }}
            </template>
            <template v-else>
              {{ zh ? '搜索标题、正文或标签' : 'Search titles, content, or tags' }}
            </template>
          </div>
          <div
            v-if="query && results.length" ref="resultsContainer" class="yun-search-results"
            :style="{ '--yun-search-fade-bottom': arrivedState.bottom ? '0px' : '56px' }"
          >
            <AppLink
              v-for="(result, index) in results" :key="result.item.link" :to="result.item.link"
              class="yun-search-result" :class="{ 'is-selected': index === activeIndex }"
              @focus="activeIndex = index" @click="emit('close')"
            >
              <span class="yun-search-result-title">{{ result.item.title }}</span>
              <span v-if="result.item.excerpt" class="yun-search-result-excerpt">{{ excerpt(result.item.excerpt) }}</span>
              <span class="yun-search-result-path">{{ result.item.link }}</span>
            </AppLink>
          </div>
          <p v-else-if="query && !loading && !failed" class="yun-search-empty">
            {{ zh ? '没有匹配的文章，试试更短的关键词。' : 'No matching articles. Try a shorter keyword.' }}
          </p>
          <footer class="yun-search-footer">
            <span>{{ zh ? '站内搜索' : 'Site search' }}</span>
            <span class="yun-search-shortcuts"><kbd>↑</kbd><kbd>↓</kbd> {{ zh ? '选择' : 'Select' }} <kbd>↵</kbd> {{ zh ? '打开' : 'Open' }} <kbd>esc</kbd> {{ zh ? '关闭' : 'Close' }}</span>
          </footer>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
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
  transition: var(--va-transition-duration-fast);
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
  transition: all var(--va-transition-duration-fast);

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

<style lang="scss" scoped>
.yun-fuse-dialog {
  --search-line: rgb(30 40 60 / 0.14);
  --search-selection: rgb(0 102 204 / 0.05);
  --search-muted: #626b77;

  position: fixed;
  z-index: 1001;
  inset: 0;
  width: 100%;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: clamp(64px, 10vh, 100px) 24px 24px;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  color: var(--va-c-text);
  background: transparent;
  box-shadow: none;
  font-family: var(--va-font-sans, sans-serif);
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  box-sizing: border-box;

  &[data-state="open"] {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: search-appear 180ms ease-out;
  }

  button {
    font: inherit;
    cursor: pointer;
  }

  button:focus-visible, a:focus-visible {
    outline: 2px solid var(--yun-focus-color, #06c);
    outline-offset: -2px;
  }
}

:global(html.dark .yun-fuse-dialog) {
  --search-line: rgb(255 255 255 / 0.14);
  --search-selection: rgb(100 181 246 / 0.07);
  --search-muted: #aeb6c2;
}

.yun-search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgb(250 251 253 / 0.84);
  backdrop-filter: blur(30px);
}

:global(html.dark .yun-search-backdrop) {
  background: rgb(22 24 29 / 0.84);
}

.yun-search-field {
  width: min(100%, 960px);
  flex-shrink: 0;

  > span {
    display: none;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    padding: 20px 40px;
    border: 1px solid var(--search-line);
    outline: none;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font-family: var(--va-font-serif, serif);
    font-weight: 500;
    font-size: clamp(26px, 3vw, 36px);
    line-height: 1.5;
    text-align: center;
    transition: border-color 160ms ease, box-shadow 160ms ease;

    &::placeholder {
      color: var(--search-muted);
    }

    &:focus {
      border-color: var(--yun-focus-color, #06c);
      box-shadow: 0 0 0 1px var(--yun-focus-color, #06c);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }
}

.yun-search-dismiss {
  position: absolute;
  top: calc((var(--yun-nav-height, 50px) - 3rem) / 2);
  right: 0;
}

.yun-search-status {
  padding: 24px 0 20px;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--search-muted);
  flex-shrink: 0;
  text-align: center;

  button {
    color: var(--va-c-link);
    margin-left: 4px;
  }
}

.yun-search-results {
  mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - var(--yun-search-fade-bottom, 0px)), transparent 100%);
  width: min(100%, 800px);
  padding: 0 8px;
  overflow-y: auto;
  overscroll-behavior: contain;
  min-height: 0;
}

.yun-search-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 22px 16px;
  border-top: 1px solid var(--search-line);
  border-radius: 0;
  color: inherit;
  text-decoration: none;
  overflow-wrap: anywhere;
  font-weight: 400;

  &.is-selected, &:hover {
    background: var(--search-selection);
  }

  &.is-selected .yun-search-result-title {
    color: var(--va-c-link);
  }
}

.yun-search-result-title {
  font-family: var(--va-font-serif, serif);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.5;
}

.yun-search-result-excerpt {
  font-size: 14px;
  line-height: 1.8;
  color: var(--search-muted);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.yun-search-result-path {
  font-size: 12px;
  color: var(--search-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.yun-search-empty {
  margin: 0;
  padding: 32px 0;
  font-size: 14px;
  color: var(--search-muted);
  text-align: center;
}

.yun-search-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding-top: 24px;
  margin-top: auto;
  color: var(--search-muted);
  font-size: 11px;
  flex-shrink: 0;
}

.yun-search-shortcuts {
  display: flex;
  align-items: center;
  gap: 6px;

  kbd {
    font: inherit;
    min-width: 16px;
    text-align: center;
    border: 1px solid var(--search-line);
    border-radius: 4px;
    padding: 0 3px;
  }
}

@keyframes search-appear {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (width <= 640px) {
  .yun-fuse-dialog {
    padding: max(76px, calc(env(safe-area-inset-top) + 60px)) 20px max(20px, env(safe-area-inset-bottom));
  }

  .yun-search-field input {
    padding: 14px 24px;
    font-size: 26px;
  }

  .yun-search-status {
    padding: 20px 0;
  }

  .yun-search-results {
    padding: 0;
  }

  .yun-search-result {
    padding: 18px 8px;
  }

  .yun-search-result-title {
    font-size: 19px;
  }

  .yun-search-footer {
    padding-top: 16px;
  }

  .yun-search-shortcuts {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .yun-fuse-dialog[data-state="open"] {
    animation: none;
  }

  .yun-search-field input {
    transition: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .yun-search-backdrop {
    backdrop-filter: none;
  }

  .yun-fuse-dialog {
    background: var(--va-c-bg);
  }
}
</style>
