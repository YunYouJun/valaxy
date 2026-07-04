<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  themes: {
    icon: string
    name: string
    repo: string
    docsUrl?: string
    desc: string
    siteImage: string
    siteExampleUrl?: string
    tags?: string[]
  }[]
}>(), {})

const { t } = useI18n()
const keyword = ref('')
const filteredThemes = computed(() => {
  return props.themes.filter((item) => {
    return item.name.includes(keyword.value) || item.tags?.some(t => t.includes(keyword.value))
  })
})
</script>

<template>
  <div class="theme-gallery-search relative my-5">
    <div class="i-ri-search-line pointer-events-none absolute left-4 top-1/2 text-slate-400 -translate-y-1/2" />
    <input
      v-model="keyword"
      :placeholder="t('gallery.tip')"
      class="theme-gallery-search-input w-full"
      type="text" name="search"
    >
  </div>
  <ul class="m-0! p-0! grid grid-cols-1 lg:grid-cols-2" gap="5">
    <li v-for="theme, i in filteredThemes" :key="i" class="w-full list-none m-0!">
      <div
        class="theme-gallery-card"
      >
        <div class="theme-gallery-card-preview">
          <img class="theme-gallery-card-image" :src="theme.siteImage" :alt="theme.name">
          <a target="_blank" rel="noopener" :href="theme.siteExampleUrl || theme.repo" :aria-label="theme.name" class="theme-gallery-card-mask">
            <div class="i-ri-eye-line text-40px text-white" />
          </a>
        </div>
        <div class="theme-gallery-card-body">
          <a :href="theme.repo" target="_blank" rel="noopener" class="theme-gallery-card-title decoration-none!">
            <h3 class="my-0!" flex justify-center items-center>
              <div class="theme-gallery-card-icon" text-xl mr-2 :class="theme.icon" />
              <span>{{ theme.name }}</span>
            </h3>
          </a>
          <div class="theme-gallery-card-links text-xl!">
            <a class="theme-gallery-card-link text-red-600!" :href="`https://npmjs.com/package/${theme.name}`" target="_blank" rel="noopener" aria-label="NPM Package">
              <div i-ri-npmjs-line />
            </a>

            <a class="theme-gallery-card-link text-blue-600!" :href="theme.siteExampleUrl" target="_blank" rel="noopener" aria-label="Theme demo">
              <div i-ri-slideshow-2-line />
            </a>
            <a v-if="theme.docsUrl" class="theme-gallery-card-link text-green-600!" :href="theme.docsUrl" aria-label="Theme documentation">
              <div i-ri-book-open-line />
            </a>
          </div>
          <div class="theme-gallery-card-desc">
            {{ theme.desc }}
          </div>
          <ul class="theme-gallery-card-tags m-0! p-0!">
            <span v-for="tag, j in theme.tags" :key="j" class="theme-gallery-card-tag">
              #{{ tag }}
            </span>
          </ul>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.theme-gallery-search-input {
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

.theme-gallery-card {
  overflow: hidden;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.875rem;
  background: var(--va-c-bg);
  box-shadow: 0 10px 30px rgb(15 23 42 / 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--va-c-border);
    box-shadow: 0 16px 40px rgb(15 23 42 / 0.1);
  }
}

.theme-gallery-card-preview {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: var(--va-c-bg-alt);
  cursor: pointer;

  &:hover {
    .theme-gallery-card-mask {
      transform: translateY(0%);
    }
  }
}

.theme-gallery-card-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-gallery-card-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba($color: #000, $alpha: 0.58);
  transform: translateY(-100%);
  transition: transform 0.28s ease-out;
}

.theme-gallery-card-body {
  padding: 1rem 1.125rem 1.125rem;
}

.theme-gallery-card-title {
  display: block;
  color: var(--va-c-text);

  &:hover {
    color: var(--va-c-primary);
  }
}

.theme-gallery-card-icon {
  color: var(--va-c-primary);
}

.theme-gallery-card-links {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0 0.5rem;
}

.theme-gallery-card-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background: var(--va-c-default-soft);
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &:hover {
    background: var(--va-c-brand-soft);
    opacity: 0.9;
  }
}

.theme-gallery-card-desc {
  margin: 0.25rem 0 0.75rem;
  color: var(--va-c-text-2);
  line-height: 1.6;
}

.theme-gallery-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.theme-gallery-card-tag {
  display: inline-flex;
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  background: var(--va-c-default-soft);
  color: var(--va-c-text-2);
  font-size: 0.8125rem;
  line-height: 1.5;
  word-break: break-all;
}
</style>
