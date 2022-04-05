<script lang="ts" setup>
import { useConfig, useFrontmatter, useFullUrl } from 'valaxy'

const config = useConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()
</script>

<template>
  <YunBase>
    <template #content>
      <main text="left" m="auto" p="t-0 b-2">
        <slot name="header">
          <YunPostMeta :frontmatter="frontmatter" />
        </slot>
        <Transition appear>
          <router-view />
        </Transition>
        <YunSponsor v-if="frontmatter.sponsor || config.sponsor.enable" />
        <ValaxyCopyright v-if="frontmatter.copyright || config.license.enabled" :url="url" m="y-4" />
      </main>
    </template>
  </YunBase>
</template>
