<script lang="ts" setup>
import type { Post } from 'valaxy'
import { formatDate, orderByMeta, useSiteConfig } from 'valaxy'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  posts: Post[]
}>()

const { t } = useI18n()

const years = ref<number[]>([])
const postListByYear = ref<Record<string, Post[]>>({})

const siteConfig = useSiteConfig()

watch(() => props.posts, () => {
  postListByYear.value = {}
  years.value = []
  props.posts.forEach((post) => {
    if (post.hide && post.hide !== 'index')
      return
    if (post.date) {
      const year = Number.parseInt(formatDate(post.date, {
        template: 'YYYY',
      }))
      if (postListByYear.value[year]) {
        postListByYear.value[year].push(post)
      }
      else {
        years.value.push(year)
        postListByYear.value[year] = [post]
      }
    }
  })
}, { immediate: true })

const isDesc = ref(true)
const sortLabel = computed(() => isDesc.value ? t('theme.sortDesc') : t('theme.sortAsc'))
const sortedYears = computed(() => {
  const arr = [...years.value].sort((a, b) => b - a)
  return isDesc.value ? arr : arr.toReversed()
})
</script>

<template>
  <div class="post-collapse px-10 lt-sm:px-5 max-w-3xl" relative>
    <Transition appear enter-active-class="animate-fade-in animate-duration-400">
      <div w="full" text="center" class="yun-text-light" p="2">
        {{ t('counter.archives', posts.length) }}
      </div>
    </Transition>

    <div class="post-collapse-action my-2 flex justify-center">
      <button
        type="button"
        class="yun-action-btn yun-collapse-sort-btn"
        :title="sortLabel"
        :aria-label="sortLabel"
        :aria-pressed="!isDesc"
        @click="isDesc = !isDesc"
      >
        <span :class="isDesc ? 'i-ri-sort-desc' : 'i-ri-sort-asc'" aria-hidden="true" />
      </button>
    </div>

    <div v-for="year in sortedYears" :key="year" m="b-6">
      <div class="collection-title" m-0 relative>
        <h2 :id="`#archive-year-${year}`" class="archive-year" text="4xl" p="y-2">
          {{ year }}
        </h2>
      </div>

      <YunPostCollapseItem
        v-for="post, j in orderByMeta(postListByYear[year], siteConfig.orderBy, isDesc)"
        :key="j"
        :post="post"
        :i="j"
      />
    </div>
  </div>
</template>

<style lang="scss">
.yun-collapse-sort-btn.yun-action-btn {
  border: 1px solid var(--yun-surface-line);
  background-color: var(--yun-bg-elevated, var(--va-c-bg-light));

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: color-mix(in srgb, var(--va-c-link) 32%, var(--yun-surface-line));
      color: var(--va-c-link);
      background-color: color-mix(in srgb, var(--va-c-link) 6%, var(--yun-bg-elevated, var(--va-c-bg-light)));
    }
  }
}

.post-collapse {
  .collection-title {
    border-bottom: 2px solid color-mix(in srgb, var(--va-c-link) 55%, transparent);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      width: 2px;
      height: 50%;
      background: color-mix(in srgb, var(--va-c-link) 28%, transparent);
    }

    .archive-year {
      color: var(--va-c-link);
      margin: 0 1.5rem;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 35%;
        margin-left: -11px;
        margin-top: -4px;
        width: 1.5rem;
        height: 1.5rem;
        background: var(--va-c-link);
        border-radius: 50%;
      }
    }
  }
}
</style>
