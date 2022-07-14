<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import PressButton from './PressButton.vue'

const fm = useFrontmatter()
</script>

<template>
  <h1 m="t-10" text="center">
    <span text="8xl" font="black" class="gradient-text from-purple-800 to-blue-500" bg="gradient-to-r">
      {{ fm.hero.name }}
    </span>
    <br>
    <small opacity="75">LOGO NOT READY</small>
  </h1>

  <h1 m="y-10" text="center 6xl" font="black" leading="tight">
    Next Generation
    <br>
    Static <span class="gradient-text from-blue-500 to-purple-700" bg="gradient-to-r">Blog</span> Framework
  </h1>

  <div p="2" text="center">
    <PressButton
      v-for="action in fm.hero.actions"
      :key="action.link"
      :theme="action.theme"
      :link="action.link"
      :text="action.text"
    />
  </div>

  <br>
</template>
