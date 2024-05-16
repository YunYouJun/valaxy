<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Pane, Splitpanes } from 'splitpanes'
import axios from 'axios'
import { getGlobalValaxyProperty } from '../utils'

interface frontmatter {
  [key: string]: string
}
const postList = ref<frontmatter[]>([])
const mapper = ref<frontmatter>({})

onMounted(() => {
  postList.value = getGlobalValaxyProperty('postList').value
  postList.value.forEach((element) => {
    const keys = Object.keys(element)
    for (const key of keys)
      mapper.value[key] = ''
  })
})
const checkedPosts = ref<string[]>([])
function clearPosts(select: boolean) {
  checkedPosts.value.length = 0
  if (select)
    checkedPosts.value = checkedPosts.value.concat(postList.value.map(i => i.path))
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
      <button @click="clearPosts(true)">
        全选
      </button>
      <button @click="clearPosts(false)">
        清空
      </button>
      <ul class="h-full" overflow="auto" pl="12" pr="4" py="4">
        <li v-for="post in postList" :key="post.path" class="list-decimal">
          <input v-model="checkedPosts" type="checkbox" :name="post.path" :value="post.path">
          <label :for="post.path">{{ post.title }}</label>
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
