<script lang="ts" setup>
import { computed } from '@vue/reactivity';
import { useConfig, useFrontmatter, useFullUrl } from 'valaxy'

const config = useConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()

const showSponsor = computed(() => {
  if (typeof frontmatter.value.sponsor === 'boolean') {
    return frontmatter.value.sponsor
  }
  return config.value.sponsor.enable
})
</script>

<template>
  <YunBase>
    <template #content>
      <main text="left" m="auto" p="t-0 b-2">
        <slot name="header">
          <YunPostMeta :frontmatter="frontmatter" />
        </slot>
        <router-view v-slot="{ Component }">
          <Transition appear>
            <component :is="Component" />
          </Transition>
        </router-view>
        <YunSponsor v-if="showSponsor" />
        <ValaxyCopyright v-if="frontmatter.copyright || config.license.enabled" :url="url" m="y-4" />
      </main>
    </template>
  </YunBase>
</template>
