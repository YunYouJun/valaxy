<script lang="ts" setup>
import { isEmptyAddon } from 'valaxy'
import * as addonArtalk from 'valaxy-addon-artalk'
import 'valaxy-addon-artalk/client/styles/index.scss'

if (!isEmptyAddon(addonArtalk))
  addonArtalk.useArtalkWithOptions()
</script>

<template>
  <ArtalkClient />
</template>
