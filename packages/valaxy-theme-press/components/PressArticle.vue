<script setup lang="ts">
import { formatDate, useFrontmatter, useSiteStore, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const frontmatter = useFrontmatter()

const route = useRoute()
const site = useSiteStore()
const { t } = useI18n()

function findCurrentIndex() {
  return site.postList.findIndex(p => p.path === route.path)
}

const nextPost = computed(() => site.postList[findCurrentIndex() - 1])
const prevPost = computed(() => site.postList[findCurrentIndex() + 1])
const posts = computed(() => site.postList.filter(p => p.path && !p.path.endsWith('/')))

const { $tO } = useValaxyI18n()
const $title = computed(() => $tO(frontmatter.value.title))

const createdDate = computed(() => frontmatter.value.date ? formatDate(frontmatter.value.date) : '')
const updatedDate = computed(() => frontmatter.value.updated ? formatDate(frontmatter.value.updated) : '')
</script>

<template>
  <article class="press-article max-w-7xl m-auto" p="x-6" w="full">
    <header class="press-article-header pt-20 xl:pb-10 text-center">
      <h1
        class="
          text-3xl
          leading-9
          font-extrabold
          tracking-tight
          sm:text-4xl sm:leading-10
          md:text-5xl md:leading-14
          mb-4
        "
      >
        {{ $title }}
      </h1>
      <div class="press-article-meta flex items-center justify-center gap-4 text-sm">
        <span v-if="createdDate" class="inline-flex items-center gap-1">
          <span class="i-ri-calendar-line" />
          <time :datetime="createdDate">{{ createdDate }}</time>
        </span>
        <span v-if="updatedDate && updatedDate !== createdDate" class="inline-flex items-center gap-1">
          <span class="i-ri-edit-line" />
          <time :datetime="updatedDate">{{ updatedDate }}</time>
        </span>
      </div>
      <div v-if="frontmatter.tags?.length || frontmatter.categories" class="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs">
        <RouterLink
          v-for="tag in (Array.isArray(frontmatter.tags) ? frontmatter.tags : [])" :key="tag"
          class="press-article-tag px-2 py-0.5 rounded-full no-underline"
          :to="{ path: '/tags/', query: { tag } }"
        >
          #{{ tag }}
        </RouterLink>
      </div>
    </header>

    <div
      class="
        press-article-body
        xl:grid xl:grid-cols-12 xl:gap-x-6
        pb-16
        xl:pb-20
      "
      style="grid-template-rows: auto 1fr"
    >
      <PressAuthor v-if="frontmatter.author" :frontmatter="frontmatter" />
      <div class="press-article-content xl:pb-0 xl:col-span-8 xl:row-span-2">
        <RouterView />
      </div>

      <footer
        class="
          press-article-footer
          text-sm
          font-medium
          leading-5
          xl:col-start-1 xl:row-start-2 xl:col-span-2
        "
      >
        <div v-if="nextPost && nextPost.path" class="press-article-section py-8">
          <h2 class="press-article-heading">
            {{ t('article.next') }}
          </h2>
          <div class="link">
            <RouterLink :to="nextPost.path">
              {{ $tO(nextPost.title) }}
            </RouterLink>
          </div>
        </div>
        <div v-if="prevPost && prevPost.path" class="press-article-section py-8">
          <h2 class="press-article-heading">
            {{ t('article.prev') }}
          </h2>
          <div class="link">
            <RouterLink :to="prevPost.path">
              {{ $tO(prevPost.title) }}
            </RouterLink>
          </div>
        </div>

        <div v-if="posts.length" class="press-article-section py-8">
          <h2 class="press-article-heading mb-4">
            {{ t('article.all_posts') }}
          </h2>
          <ul class="space-y-2">
            <li v-for="post in posts" :key="post.path">
              <RouterLink
                class="press-article-post-link block truncate"
                :class="{ 'is-active': post.path === route.path }"
                :to="post.path || ''"
                :title="$tO(post.title)"
              >
                {{ $tO(post.title) }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="press-article-section pt-8">
          <RouterLink class="link" to="/posts/">
            ← {{ t('article.back_to_posts') }}
          </RouterLink>
        </div>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.press-article-meta,
.press-article-heading {
  color: var(--pr-c-text-2);
}

.press-article-heading {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.press-article-tag {
  color: var(--pr-c-text-2);
  background-color: var(--pr-c-surface);
  border: 1px solid var(--pr-c-divider-light);
  transition: color var(--va-transition-duration-fast), border-color var(--va-transition-duration-fast), background-color var(--va-transition-duration-fast);
}

.press-article-tag:hover {
  color: var(--pr-c-brand);
  border-color: var(--pr-c-brand);
  background-color: var(--pr-c-brand-soft);
}

.press-article-body {
  border-top: 1px solid var(--pr-c-divider-light);
}

.press-article-section + .press-article-section {
  border-top: 1px solid var(--pr-c-divider-light);
}

.press-article-post-link {
  color: var(--pr-c-text-2);
  transition: color var(--va-transition-duration-fast);
}

.press-article-post-link:hover {
  color: var(--pr-c-text-1);
}

.press-article-post-link.is-active {
  color: var(--pr-c-brand);
  font-weight: 700;
}

@media (width < 1280px) {
  .press-article-body {
    border-top: 0;
  }

  .press-article-content,
  .press-article-footer {
    border-top: 1px solid var(--pr-c-divider-light);
  }
}

@media (prefers-reduced-motion: reduce) {
  .press-article-tag,
  .press-article-post-link {
    transition: none;
  }
}
</style>
