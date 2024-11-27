<script lang="ts" setup>
import type { Post } from 'valaxy'
import { formatDate, sortByDate, useSiteConfig } from 'valaxy'
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
      const year = Number.parseInt(formatDate(post.date, 'yyyy', siteConfig.value.timezone))
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
const sortedYears = computed(() => {
  const y = years.value
  const arr = y.sort((a, b) => b - a)
  // avoid mutating the original array
  return isDesc.value ? arr : [...arr].reverse()
})
</script>

<template>
  <div class="post-collapse px-10 lt-sm:px-5 max-w-3xl" relative>
    <Transition appear enter-active-class="animate-fade-in animate-duration-400">
      <div w="full" text="center" class="yun-text-light" p="2">
        {{ t('counter.archives', posts.length) }}
      </div>
    </Transition>

    <div class="post-collapse-action" text="center">
      <button class="yun-icon-btn shadow hover:shadow-md" @click="isDesc = !isDesc">
        <div v-if="isDesc" i-ri-sort-desc />
        <div v-else i-ri-sort-asc />
      </button>
    </div>

    <div v-for="year in sortedYears" :key="year" m="b-6">
      <div class="collection-title" m-0 relative>
        <h2 :id="`#archive-year-${year}`" class="archive-year" text="4xl" p="y-2">
          {{ year }}
        </h2>
      </div>

      <YunPostCollapseItem
        v-for="post, j in sortByDate(postListByYear[year], isDesc)"
        :key="j"
        :post="post"
        :i="j"
      />
    </div>
  </div>
</template>

<style lang="scss">
.post-collapse {
  .collection-title {
    border-bottom: 2px solid rgba(var(--va-c-primary-rgb), 0.6);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      width: 2px;
      height: 50%;
      background: rgba(var(--va-c-primary-rgb), 0.3);
    }

    .archive-year {
      color: var(--va-c-primary);
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
        background: var(--va-c-primary);
        border-radius: 50%;
      }
    }
  }
}
</style>
