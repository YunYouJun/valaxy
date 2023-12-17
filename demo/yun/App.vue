<!-- You can mount anything here -->

<script lang="ts" setup>
// do script
import { onMounted } from 'vue'

onMounted(() => {
  const utterScript = document.createElement('script')

  utterScript.src = 'https://utteranc.es/client.js'
  utterScript.async = true
  utterScript.crossOrigin = 'anonymous'

  utterScript.setAttribute('repo', 'YunYouJun/valaxy')
  utterScript.setAttribute('issue-term', 'pathname')
  utterScript.setAttribute('label', 'utterances')
  utterScript.setAttribute('theme', 'github-light')

  const commentContainer = document.querySelector('.comment')
  if (commentContainer)
    commentContainer.appendChild(utterScript)
})
</script>

<template>
  <!-- try it -->
  <div />
</template>
