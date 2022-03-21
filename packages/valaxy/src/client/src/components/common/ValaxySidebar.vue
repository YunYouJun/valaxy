<template>
  <ValaxyOverlay :show="active" @click="active = !active" />

  <ValaxyHamburger id="menu-btn" :active="active" class="sidebar-toggle yun-icon-btn" @click="active = !active" />

  <aside class="transition shadow hover:shadow-lg" :class="['sidebar', active && 'open']">
    <YunSidebar />

    <YunConfig />
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
}>(), {
  open: false,
})

const active = ref(props.open)
</script>

<style lang="scss">
@use "sass:map";

@use "~/styles/vars" as *;

#menu-btn {
  display: inline-flex;
  position: fixed;
  left: 0.8rem;
  top: 0.6rem;
  line-height: 1;
  z-index: map.get($z-index, 'menu-btn');
  cursor: pointer;
}
</style>
