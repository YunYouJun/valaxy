<script setup lang="ts">
import { defineArticle, useSchemaOrg } from '@unhead/schema-org'

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
