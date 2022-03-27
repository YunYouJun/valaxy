<script lang="ts" setup>
import { useConfig, useFrontmatter, useFullUrl } from 'valaxy'
import Base from './base.vue'

const config = useConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()
</script>

<template>
  <Base>
    <template #content>
      <YunPageHeader :title="frontmatter.title" />
      <main text="left" m="auto" p="t-0 b-2">
        <slot name="header">
          <YunPostMeta :frontmatter="frontmatter" />
        </slot>
        <router-view />
        <YunSponsor v-if="frontmatter.sponsor || config.sponsor.enable" />
        <ValaxyCopyright v-if="frontmatter.copyright || config.license.enabled" :url="url" m="y-4" />
      </main>
    </template>
  </Base>
</template>
