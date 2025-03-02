<script setup lang="ts">
import { onMounted, ref } from 'vue'

const num = ref(100)

/**
 * 如果你需要操作 DOM 元素，可以在 onMounted 钩子中执行
 */
onMounted(() => {
  setTimeout(() => {
    document.title = 'Custom Vue Demo'
  }, 3000)
})
</script>

<template>
  <div class="font-bold text-red custom-style">
    {{ num }}
  </div>
</template>

<style>
.custom-style {
  font-size: 20px;
}
</style>
