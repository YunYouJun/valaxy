<script lang="ts" setup>
import type { NormalizedValaxyAddon } from './AddonGallery.vue'

defineProps<{
  addon: NormalizedValaxyAddon
}>()

const emit = defineEmits(['tagClick'])

function handleTagClick(tag: string) {
  emit('tagClick', tag)
}
</script>

<template>
  <div
    class="addon-gallery-card"
  >
    <a class="addon-gallery-card-title decoration-none!" :href="addon.repo" target="_blank" rel="noopener">
      <h3 class="my-0!" flex="~" items-center>
        <span class="addon-gallery-card-icon" :class="addon.icon" />
        <span>{{ addon.name }}</span>
      </h3>
    </a>

    <div class="addon-gallery-card-meta">
      <a class="addon-gallery-card-link text-red-600!" :href="`https://npmjs.com/package/${addon.name}`" target="_blank" rel="noopener" aria-label="NPM Package">
        <div i-ri-npmjs-line />
      </a>
      <a class="addon-gallery-card-link text-slate-600! dark:text-slate-200!" :href="addon.repo" target="_blank" rel="noopener" aria-label="GitHub Repository">
        <div i-ri-github-line />
      </a>
      <template v-if="addon.author">
        <span class="addon-gallery-card-by">By</span>
        <span v-for="(author, index) in addon.author" :key="author" class="addon-gallery-card-author">
          <a
            class="addon-gallery-card-author-link"
            :href="`https://github.com/${author}`"
            target="_blank"
            rel="noopener"
          >{{ author }}</a>
          <span v-if="index < addon.author.length - 1">, </span>
        </span>
      </template>
    </div>

    <div class="addon-gallery-card-desc" lang="en">
      <div :title="addon.desc">
        {{ addon.desc }}
      </div>
    </div>
    <div class="addon-gallery-card-desc" lang="zh-CN">
      <div :title="addon.desc_zh">
        {{ addon.desc_zh }}
      </div>
    </div>
    <ul class="addon-gallery-card-tags m-0! p-0!">
      <button
        v-for="tag in addon.tags" :key="tag"
        type="button"
        class="addon-gallery-card-tag"
        @click="handleTagClick(tag)"
      >
        #{{ tag }}
      </button>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.addon-gallery-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.875rem;
  padding: 1.125rem;
  background: var(--va-c-bg);
  box-shadow: 0 10px 30px rgb(15 23 42 / 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--va-c-border);
    box-shadow: 0 16px 40px rgb(15 23 42 / 0.1);
  }
}

.addon-gallery-card-title {
  color: var(--va-c-text);
  overflow-wrap: anywhere;

  &:hover {
    color: var(--va-c-primary);
  }
}

.addon-gallery-card-icon {
  margin-right: 0.5rem;
  color: var(--va-c-primary);
  font-size: 1.25rem;
}

.addon-gallery-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  color: var(--va-c-text-3);
  font-size: 0.875rem;
}

.addon-gallery-card-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background: var(--va-c-default-soft);
  font-size: 1.125rem;
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &:hover {
    background: var(--va-c-brand-soft);
    opacity: 0.9;
  }
}

.addon-gallery-card-by {
  margin-left: 0.25rem;
}

.addon-gallery-card-author-link {
  color: var(--va-c-text-2);

  &:hover {
    color: var(--va-c-primary);
  }
}

.addon-gallery-card-desc {
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
}

.addon-gallery-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: auto !important;
}

.addon-gallery-card-tag {
  display: inline-flex;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  background: var(--va-c-default-soft);
  color: var(--va-c-text-2);
  font-size: 0.8125rem;
  line-height: 1.5;
  word-break: break-all;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--va-c-primary);
    color: var(--va-c-primary);
    background: var(--va-c-brand-soft);
  }
}
</style>
