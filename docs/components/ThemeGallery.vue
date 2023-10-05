<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  themes: {
    icon: string
    name: string
    repo: string
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
  <div class="relative my-4 flex-center" flex="~" rounded>
    <div class="i-ri-search-line absolute text-slate-400 left-0 pl-12" />
    <input
      v-model="keyword"
      :placeholder="t('gallery.tip')"
      pl-10 pr-4
      class="focus:border-purple-500 b-2 w-full h-12"
      dark="border-dark-200"
      bg="bg-white dark:bg-dark-500"
      rounded-lg transition
      type="text" name="search"
    >
  </div>
  <ul class="m-0! p-0! sm:grid-cols-1 lg:grid-cols-2 grid" gap="4">
    <li v-for="theme, i in filteredThemes" :key="i" class="w-full list-none m-0!">
      <div
        class="transition bg-$va-c-bg-alt" border rounded-xl
        dark="border-dark-200"
        overflow-hidden
        hover="bg-$va-c-bg shadow-md"
      >
        <div class="img-wrapper" cursor-pointer>
          <img w="full" h="58" class="object-cover" :src="theme.siteImage" :alt="theme.name">
          <a target="_blank" :href="theme.siteExampleUrl || theme.repo" :alt="theme.name" class="mask">
            <div class="i-ri-eye-line text-40px text-white " />
          </a>
        </div>
        <div px-4 pb-4>
          <a :href="theme.repo" target="_blank" class="decoration-none!">
            <h3 class="mt-4!" flex justify-center items-center>
              <div text-xl mr-2 :class="theme.icon" />
              <span>{{ theme.name }}</span>
            </h3>
          </a>
          <p class="my-1! text-xl!">
            <a mr-2 class="text-red-600!" :href="`https://npmjs.com/package/${theme.name}`" target="_blank" alt="NPM Package">
              <div i-ri-npmjs-line />
            </a>

            <a mr-2 class="text-blue-600!" :href="theme.siteExampleUrl" target="_blank" alt="NPM Package">
              <div i-ri-slideshow-2-line />
            </a>
          </p>
          <p class="my-1!">
            {{ theme.desc }}
          </p>
          <ul class="m-0! p-0! flex flex-wrap">
            <span v-for="tag, j in theme.tags" :key="j" class="break-all text-gray mr-6px">
              #{{ tag }}
            </span>
          </ul>
        </div>
      </div>
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
