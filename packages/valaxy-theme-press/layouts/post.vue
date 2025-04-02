<script setup lang="ts">
import { defineArticle, useSchemaOrg } from '@unhead/schema-org/vue'

useSchemaOrg([
  defineArticle({
    '@type': 'Article',
  }),
])
</script>

<template>
  <Layout>
    <PressArticle />
  </Layout>
</template>
