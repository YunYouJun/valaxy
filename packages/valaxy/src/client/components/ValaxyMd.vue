<script lang="ts" setup>
import type { Post } from 'valaxy'
import { onMounted, ref } from 'vue'
import { useAplayer } from '~/composables/widgets/aplayer'
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

</script>

<template>
  <article v-if="$slots.default" class="markdown-body">
    <slot ref="content" @vnode-updated="updateDom" />

    <template v-if="frontmatter.end">
      <slot name="end">
        <div m="y-4" class="flex justify-center items-center">
          <hr class="inline-flex" w="full" m="!y-2">
          <span p="x-4" font="serif">Q.E.D.</span>
          <hr class="inline-flex" w="full" m="!y-2">
        </div>
      </slot>
    </template>
  </article>
</template>
