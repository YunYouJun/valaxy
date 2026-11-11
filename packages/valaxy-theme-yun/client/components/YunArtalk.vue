<script lang="ts" setup>
import { getAddonModule, isEmptyAddon } from 'valaxy'
import * as addonArtalk from 'valaxy-addon-artalk'
import 'valaxy-addon-artalk/client/styles/index.scss'

if (!isEmptyAddon(addonArtalk))
  getAddonModule<{ useArtalkWithOptions: () => void }>(addonArtalk).useArtalkWithOptions?.()
</script>

<template>
  <ArtalkClient />
</template>
