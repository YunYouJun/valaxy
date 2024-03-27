<script lang="ts" setup>
import * as addonArtalk from 'valaxy-addon-artalk'
import 'valaxy-addon-artalk/client/styles/index.scss'
import { isEmptyAddon } from 'valaxy'

if (!isEmptyAddon(addonArtalk))
  addonArtalk.useArtalkWithOptions()
</script>

<template>
  <ArtalkClient />
</template>
