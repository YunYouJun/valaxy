<script lang="ts" setup>
import type { Post } from 'valaxy'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAplayer, useCodePen, useKatex } from '~/composables'
import { wrapTable } from '~/utils'

const props = defineProps<{
  frontmatter: Post
  excerpt?: string
}>()

const { t } = useI18n()

const content = ref()
function updateDom() {
  wrapTable(content.value)
}

onMounted(() => {
  updateDom()
})

// features
if (props.frontmatter.katex)
  useKatex()

// widgets
if (props.frontmatter.aplayer)
  useAplayer()

if (props.frontmatter.codepen)
  useCodePen()
</script>

<template>
  <article v-if="$slots.default" class="markdown-body">
    <slot ref="content" @vnode-updated="updateDom" />

    <div text="center">
      <a
        v-if="frontmatter.url"
        :href="frontmatter.url"
        class="post-link-btn shadow hover:shadow-md"
        rounded
        target="_blank"
        m="b-4"
      >
        {{ t('post.view_link') }}
      </a>
    </div>

    <slot v-if="typeof frontmatter.end !== 'undefined'" name="end">
      <div m="y-4" class="end flex justify-center items-center">
        <hr class="line inline-flex" w="full" m="!y-2">
        <span p="x-4" font="serif" class="whitespace-nowrap">
          {{ frontmatter.end ? 'Q.E.D.' : 'To Be Continued.' }}
        </span>
        <hr class="line inline-flex" w="full" m="!y-2">
      </div>
    </slot>
  </article>
</template>

<style lang="scss">
.end {
  .line {
    height: 1px;
  }
}
</style>
