<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { Post } from 'valaxy'
import { formatDate, sortByDate } from 'valaxy'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  posts: Post[]
}>()

const { t } = useI18n()

const years = ref<number[]>([])
const postListByYear = ref<Record<string, Post[]>>({})

watch(() => props.posts, () => {
  postListByYear.value = {}
  years.value = []
  props.posts.forEach((post) => {
    if (post.hide && post.hide !== 'index')
      return
    if (post.date) {
      const year = Number.parseInt(formatDate(post.date, 'YYYY'))
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
  return isDesc.value ? arr : arr.reverse()
})
</script>

<template>
  <div class="post-collapse px-10 lt-sm:px-5">
    <div w="full" text="center" class="yun-text-light" p="2">
      {{ t('counter.archives', posts.length) }}
    </div>

    <div class="post-collapse-action" text="center">
      <button class="yun-icon-btn shadow hover:shadow-md" @click="isDesc = !isDesc">
        <div v-if="isDesc" i-ri-sort-desc />
        <div v-else i-ri-sort-asc />
      </button>
    </div>

    <div v-for="year in sortedYears" :key="year" m="b-6">
      <div class="collection-title">
        <h2 :id="`#archive-year-${year}`" class="archive-year" text="4xl" p="y-2">
          {{ year }}
        </h2>
      </div>

      <article v-for="post, j in sortByDate(postListByYear[year], isDesc)" :key="j" class="post-item">
        <header class="post-header">
          <div class="post-meta">
            <time v-if="post.date" class="post-time" font="mono" opacity="80">{{ formatDate(post.date, 'MM-DD') }}</time>
          </div>
          <h2 class="post-title" font="serif black">
            <router-link :to="post.path || ''" class="post-title-link">
              {{ post.title }}
            </router-link>
          </h2>
        </header>
      </article>
    </div>
  </div>
</template>

<style lang="scss">
.post-collapse {
  position: relative;

  &-title {
    font-size: 2rem;
    text-align: center;
  }

  .collection-title {
    position: relative;
    margin: 0;
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

  .post-item {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 2px;
      height: 100%;
      background: rgba(var(--va-c-primary-rgb), 0.3);
    }
  }

  .post-header {
    display: flex;
    align-items: center;

    position: relative;
    border-bottom: 1px solid rgba(var(--va-c-primary-rgb), 0.3);
    display: flex;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: 10px;
      height: 10px;
      margin-left: -4px;
      border-radius: 50%;
      border: 1px solid var(--va-c-primary);
      background-color: var(--va-c-bg-light);
      z-index: 1;
      transition: background var(--va-transition-duration);
    }

    &:hover {
      &::before {
        background: var(--va-c-primary);
      }
    }

    .post-title {
      margin-left: 0.1rem;
      padding: 0;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;

      .post-title-link {
        .icon {
          width: 1.1rem;
          height: 1.1rem;
          margin-right: 0.3rem;
        }
      }
    }

    .post-meta {
      font-size: 1rem;
      margin: 1rem 0 1rem 1.2rem;
      white-space: nowrap;
    }
  }
}

.last-word {
  font-size: 1rem;
  margin-top: 1rem;
  margin-bottom: 0;
}
</style>
