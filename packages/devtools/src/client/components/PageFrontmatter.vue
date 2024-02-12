<script lang="ts" setup>
defineProps<{
  frontmatter?: object
}>()
</script>

<template>
  <div>
    <ul v-if="frontmatter">
      <li v-for="(value, key) in frontmatter" :key="key">
        <strong>{{ key }}</strong>: {{ value }}
      </li>
    </ul>
  </div>
</template>
