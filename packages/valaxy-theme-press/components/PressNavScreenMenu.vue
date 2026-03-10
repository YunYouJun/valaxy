<script lang="ts" setup>
import { useLocaleConfig } from '../composables'

const { localeConfig } = useLocaleConfig()
</script>

<template>
  <nav v-if="localeConfig.nav" class="pr-nav-screen-menu">
    <template v-for="item in localeConfig.nav" :key="item.text">
      <PressNavScreenMenuLink
        v-if="'link' in item"
        :text="item.text"
        :link="item.link"
      />
      <PressNavScreenMenuGroup
        v-else
        :text="item.text || ''"
        :items="item.items"
      />
    </template>
  </nav>
</template>
