<script setup lang="ts">
import { ref } from 'vue'

const num = ref(100)
</script>

<template>
  <div class="text-bold text-red">
    {{ num }}
  </div>
</template>
