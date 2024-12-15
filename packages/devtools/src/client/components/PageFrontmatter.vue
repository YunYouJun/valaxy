<script lang="ts" setup>
import type { PostFrontMatter } from 'valaxy'
import axios from 'axios'

import consola from 'consola'
import { ref, toRaw } from 'vue'
import { activePath, pageData } from '../composables/app'

const props = defineProps<{
  frontmatter: PostFrontMatter
}>()

const newFm = ref<PostFrontMatter>(props.frontmatter)
async function saveNewFm() {
  // const data = await fetch('/valaxy-devtools-api/frontmatter', {
  //   method: 'POST',
  //   // body: JSON.stringify(toRaw(newFm.value)),
  // })

  const res = await axios.post('/valaxy-devtools-api/frontmatter', {
    path: activePath.value,
    pageData: pageData.value,
    frontmatter: toRaw(newFm.value),
  })
  if (res)
    consola.success('Frontmatter saved')

  // console.log(res)
}
</script>

<template>
  <div>
    <ul v-if="frontmatter">
      <li v-for="(value, key) in frontmatter" :key="key">
        <strong>{{ key }}</strong>
        <span mr-1>:</span>

        <template v-if="key === 'tags'">
          <VDTag v-for="tag in value" :key="tag">
            {{ tag }}
          </VDTag>
        </template>
        <template v-else-if="key === 'categories'">
          <VDPostCategories :categories="value" />
        </template>
        <template v-else-if="key === 'encryptedContent'">
          [Encrypted]
        </template>
        <template v-else-if="key === 'partiallyEncryptedContents'">
          [Partially Encrypted]
        </template>
        <template v-else-if="key === 'title'">
          <!-- eslint-disable-next-line vue/no-mutating-props -->
          <AGUIInput v-model="newFm.title" />
        </template>
        <template v-else>
          {{ value }}
        </template>
      </li>
    </ul>

    <AGUIButton @click="saveNewFm">
      Save Frontmatter
    </AGUIButton>
  </div>
</template>
