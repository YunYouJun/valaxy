<script lang="ts" setup>
import { isClient, useScrollLock } from '@vueuse/core'
import MarkdownIt from 'markdown-it'
import { useFuseSearch } from 'valaxy'
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits(['close'])

const md = new MarkdownIt({
  html: true,
  linkify: true,
})

const input = ref('')
const isLocked = useScrollLock(isClient ? document.documentElement : null)
const { t, locale } = useI18n()
const { results, fetchFuseListData } = useFuseSearch(input)

const searchInputRef = ref<HTMLInputElement>()

function handleModalClick(event: Event) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

watch(() => props.open, (val) => {
  if (val) {
    fetchFuseListData()
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
  else {
    input.value = ''
  }
})

function getResultTitle(title: string | Record<string, string>): string {
  return typeof title === 'string'
    ? title
    : title[locale.value] || title.en || Object.values(title)[0]
}

function getResultKey(title: string | Record<string, string>): string {
  return typeof title === 'string'
    ? title
    : title.en || Object.values(title)[0]
}
</script>

<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @enter="isLocked = true"
      @after-leave="isLocked = false"
    >
      <div
        v-if="open"
        class="press-search-modal"
        @click="handleModalClick"
      >
        <div class="press-search-content">
          <div class="press-search-header">
            <div class="press-search-input-wrapper">
              <div class="press-search-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" fill="currentColor" />
                </svg>
              </div>
              <input
                ref="searchInputRef"
                v-model="input"
                class="press-search-input"
                :placeholder="t('search.placeholder')"
                @keydown.esc="emit('close')"
              >
              <button
                class="press-search-close"
                @click="emit('close')"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.28 5.72a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.72z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="input" class="press-search-hits">
            <span class="press-search-hits-text">
              {{ t('search.hits', results.length || 0) }}
            </span>
          </div>

          <div v-if="results.length > 0" class="press-search-results">
            <div class="press-search-container">
              <div class="press-result-list">
                <AppLink
                  v-for="(result, index) in results"
                  :key="getResultKey(result.item.title)"
                  :to="result.item.link"
                  class="press-result-item"
                  :style="{ animationDelay: `${index * 50}ms` }"
                  @click="emit('close')"
                >
                  <div class="press-result-content">
                    <h3 class="press-result-title">
                      {{ getResultTitle(result.item.title) }}
                    </h3>
                    <p class="press-result-excerpt markdown-body" v-html="md.render(result.item.excerpt || '')" />
                    <div class="press-result-meta">
                      <span class="press-result-link">
                        {{ result.item.link }}
                      </span>
                      <span class="press-result-score">
                        <span class="press-result-score-label">Score:</span>
                        <span class="press-result-score-value">{{ result.refIndex }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="press-result-arrow">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 4.5L12.5 9.5L7.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                </AppLink>
              </div>
            </div>

            <div class="press-search-footer">
              <div class="press-search-footer-content">
                <span class="press-search-powered-by">Search by Local</span>
              </div>
            </div>
          </div>

          <div v-else-if="input && results.length === 0" class="press-search-empty">
            <div class="press-search-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <p class="press-search-empty-text">
              No results found
            </p>
            <p class="press-search-empty-subtext">
              Try adjusting your search terms
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.press-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  backdrop-filter: blur(20px);
  z-index: var(--pr-z-search);
  background-color: rgb(0 0 0 / 0.4);
  pointer-events: auto;
}

.press-search-content {
  width: 100%;
  max-width: 680px;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.press-search-header {
  width: 100%;
  margin-bottom: 1.5rem;
}

.press-search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 2px solid var(--vp-c-divider);
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.1);
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--vp-c-brand);
    box-shadow: 0 4px 20px rgb(var(--vp-c-brand-rgb), 0.15);
  }
}

.press-search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.press-search-input {
  flex: 1;
  padding: 0.875rem 0;
  font-size: 1.125rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  background: transparent;
  border: none;
  outline: none;
  font-weight: 500;

  &::placeholder {
    color: var(--vp-c-text-3);
    font-weight: 400;
  }
}

.press-search-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--vp-c-text-3);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: var(--vp-c-text-1);
  }
}

.press-search-hits {
  width: 100%;
  max-width: 600px;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
}

.press-search-hits-text {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  font-weight: 500;
}

.press-search-results {
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 280px);
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.1);
  overflow: hidden;
}

.press-search-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.press-result-list {
  width: 100%;
  flex: 1;
}

.press-result-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: all 0.2s ease;
  animation: slide-in-up 0.3s ease forwards;
  opacity: 0;
  transform: translateY(10px);

  &:hover {
    background-color: var(--vp-c-bg-soft);
    transform: translateY(-1px);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--vp-c-divider);
  }
}

.press-result-content {
  flex: 1;
  min-width: 0;
}

.press-result-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.press-result-excerpt {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.press-result-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--vp-c-text-3);
}

.press-result-link {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.press-result-score {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  margin-left: 1rem;
}

.press-result-score-label {
  color: var(--vp-c-text-3);
}

.press-result-score-value {
  color: var(--vp-c-brand);
  font-weight: 600;
}

.press-result-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--vp-c-text-3);
  margin-left: 0.75rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.press-result-item:hover .press-result-arrow {
  color: var(--vp-c-brand);
  transform: translateX(2px);
}

.press-search-footer {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex-shrink: 0;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.press-search-footer-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.press-search-powered-by {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.press-search-empty {
  width: 100%;
  max-width: 600px;
  padding: 3rem 1rem;
  text-align: center;
}

.press-search-empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: var(--vp-c-text-3);
}

.press-search-empty-text {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.press-search-empty-subtext {
  margin: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

@keyframes slide-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// Scrollbar styling
.press-search-container::-webkit-scrollbar {
  width: 6px;
}

.press-search-container::-webkit-scrollbar-track {
  background: transparent;
}

.press-search-container::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 3px;
}

.press-search-container::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-3);
}

@media (width <= 768px) {
  .press-search-modal {
    padding-top: 1rem;
  }

  .press-search-content {
    padding: 0 1rem;
  }

  .press-search-input-wrapper {
    max-width: 100%;
  }

  .press-search-results {
    max-height: calc(100vh - 240px);
  }

  .press-result-item {
    padding: 0.875rem 1rem;
  }

  .press-result-title {
    font-size: 0.9375rem;
  }

  .press-result-excerpt {
    font-size: 0.8125rem;
  }
}
</style>
