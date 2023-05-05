<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  themes: {
    name: string
    repo: string
    desc: string
    siteImage: string
    siteExampleURL?: string
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
  <div class="search-wrapper relative mx-0.5 my-4">
    <div class="i-ri-search-line absolute text-slate-400 absolute inset-y-0 top-50%  -translate-y-2/4 pl-8 " />
    <input
      v-model="keyword" :placeholder="t('gallery.tip')"
      class="placeholder:text-slate-400
      focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1
      border border-slate-300
      pl-8 pr-3 b-3 pl-4 w-full h-16"
      type="text" name="search"
    >
  </div>
  <ul class="m-0 p-0 sm:grid-cols-1 lg:grid-cols-2 grid">
    <li v-for="theme, i in filteredThemes" :key="i" class="w-full lg:p-4 sm:pb-4 list-none">
      <div class="img-wrapper" cursor-pointer>
        <img :src="theme.siteImage" :alt="theme.name">
        <a target="_blank" :href="theme.siteExampleURL || theme.repo" :alt="theme.name" class="mask">
          <div class="i-ri-eye-line text-40px text-white " />
        </a>
      </div>
      <a :href="theme.repo" target="_blank">
        <h3> {{ theme.name }}</h3>
      </a>
      <p>{{ theme.desc }}</p>
      <ul class=" m-0 p-0 flex flex-wrap">
        <span v-for="tag, j in theme.tags" :key="j" class="break-all text-gray mr-6px">
          #{{ tag }}
        </span>
      </ul>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.img-wrapper {
  position: relative;
  overflow: hidden;
  &:hover {
    .mask {
      transform: translateY(0%);
    }
  }
  .mask {
    transform: translateY(-100%);
    transition: transform 0.5s ease-out;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba($color: #000000, $alpha: 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
