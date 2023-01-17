<script lang="ts" setup>
import valaxyLogoPng from '../assets/images/valaxy-logo.png'
</script>

<template>
  <div class="valaxy-logo-container" relative inline-flex justify="center" items="center">
    <div class="absolute bg-image" />
    <img max-w="50" m="auto" :src="valaxyLogoPng" alt="Valaxy Logo" z="1">
  </div>
</template>

<style lang="scss" scoped>
.valaxy-logo-container {
  &:hover {
    .bg-image {
      opacity: 0.4;
    }
  }
}
.bg-image {
  border-radius: 50%;
  filter: blur(72px);
  max-width: 350px;
  width: 150%;
  height: 150%;
  background-image: linear-gradient(-45deg, rgb(108, 34, 236) 50%, rgba(59,130,246,var(--un-to-opacity, 1)) 50%);
  opacity: 0.3;
  transition: opacity 0.2s;
}
</style>
