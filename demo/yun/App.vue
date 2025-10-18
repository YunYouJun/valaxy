<!-- You can mount anything here -->

<script lang="ts" setup>
import { useUtterances } from './composables/use-utterances'

useUtterances({
  /**
   * use your repo
   */
  repo: 'YunYouJun/valaxy',
  issueTerm: 'pathname',
  label: 'utterances',
})
</script>

<template>
  <!-- try it -->
  <div />
</template>
