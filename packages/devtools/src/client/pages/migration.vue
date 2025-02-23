<script lang="ts" setup>
import axios from 'axios'
import Button from 'primevue/button'
import { Pane, Splitpanes } from 'splitpanes'
import { ref } from 'vue'

import { postList } from '../stores/app'

interface frontmatter {
  [key: string]: string
}
const mapper = ref<frontmatter>({})

const checkedPosts = ref<string[]>([])
function clearPosts(select: boolean) {
  checkedPosts.value.length = 0
  if (select)
    checkedPosts.value = checkedPosts.value.concat(postList.value.posts.map(i => i.filePath))
}

async function migration() {
  const update: frontmatter = {}
  for (const key in mapper.value) {
    if (mapper.value[key] !== '')
      update[key] = mapper.value[key]
  }
  const res = await axios.post('/valaxy-devtools-api/migration', {
    pageData: checkedPosts.value,
    frontmatter: update,
  })
  if (res.data === 'ok') {
    // console.log('migration success')
  }
}
</script>

<template>
  <Splitpanes class="h-full">
    <Pane>
      <div flex="~ gap-2" class="items-center justify-center">
        <Button @click="clearPosts(true)">
          全选
        </Button>
        <Button @click="clearPosts(false)">
          清空
        </Button>
      </div>
      <ul class="h-full" overflow="auto" pl="12" pr="4" py="4">
        <li v-for="post in postList.posts" :key="post.filePath" class="list-decimal">
          <input v-model="checkedPosts" type="checkbox" :name="post.filePath" :value="post.filePath">
          <label :for="post.filePath">{{ post.frontmatter.title }}</label>
        </li>
      </ul>
    </Pane>
    <Pane>
      <h2>原frontmatter字段->新字段</h2>
      <button @click="migration">
        提交
      </button>
      <ul class="h-full" overflow="auto" pl="12" pr="4" py="4">
        <li v-for="(_, key) in mapper" :key="key">
          <label :for="key as string" style="margin-right: 20px;">{{ key }} -></label>
          <input v-model="mapper[key]" :name="key as string">
        </li>
      </ul>
    </Pane>
  </Splitpanes>
</template>
