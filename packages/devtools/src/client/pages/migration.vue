<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { getGlobalValaxyProperty } from '../utils'

const postList = ref<string[]>([])

onMounted(() => {
  postList.value = getGlobalValaxyProperty('postList').value.map(i => i.path)
})
const checkedPosts = ref<string[]>([])
function clearPosts(select: boolean) {
  checkedPosts.value.length = 0
  if (select)
    checkedPosts.value = checkedPosts.value.concat(postList.value)
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
        <li v-for="post in postList" :key="post" class="list-decimal">
          <input v-model="checkedPosts" type="checkbox" :name="post" :value="post">
          <label :for="post">{{ post }}</label>
        </li>
      </ul>
    </Pane>
    <Pane>
      <h2>原frontmatter字段->新字段</h2>
    </Pane>
  </Splitpanes>
</template>
