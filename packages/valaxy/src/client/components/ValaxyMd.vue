<script lang="ts" setup>
import type { Post } from 'valaxy'
import { onMounted, ref } from 'vue'
import { useAplayer, useKatex } from '~/composables'
import { wrapTable } from '~/utils'

const props = defineProps<{
  frontmatter: Post
  excerpt?: string
}>()

const content = ref()
function updateDom() {
  wrapTable(content.value)
}

onMounted(() => {
  updateDom()
})

if (props.frontmatter.aplayer)
  useAplayer()

if (props.frontmatter.katex)
  useKatex()
</script>

<template>
  <article v-if="$slots.default" class="markdown-body">
    <slot ref="content" @vnode-updated="updateDom" />

    <template v-if="typeof frontmatter.end !== 'undefined'">
      <slot name="end">
        <div m="y-4" class="end flex justify-center items-center">
          <hr class="line inline-flex" w="full" m="!y-2">
          <span p="x-4" font="serif" class="whitespace-nowrap">
            {{ frontmatter.end ? 'Q.E.D.' : 'To Be Continued.' }}
          </span>
          <hr class="line inline-flex" w="full" m="!y-2">
        </div>
      </slot>
    </template>
  </article>
</template>

<style lang="scss">
.end {
  .line {
    height: 1px;
  }
}
</style>
