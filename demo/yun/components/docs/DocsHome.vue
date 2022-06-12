<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <h1 m="t-10" text="center">
    <span text="8xl" font="black" class="gradient-text from-purple-800 to-blue-500" bg="gradient-to-r">Valaxy</span>
    <br>
    <small opacity="75">LOGO NOT READY</small>
  </h1>

  <h1 m="y-10" text="center 6xl" font="black" leading="tight">
    Next Generation
    <br>
    Static <span class="gradient-text from-blue-500 to-purple-700" bg="gradient-to-r">Blog</span> Framework
  </h1>

  <div p="2" text="center">
    <button class="sese-btn btn" bg="gradient-to-r" @click="router.push('/docs/guide/getting-started')">
      Get Started
    </button>
  </div>

  <br>

  <p align="center">
    <a href="https://sponsors.yunyoujun.cn">
      <img src="https://sponsors.yunyoujun.cn/sponsors.svg">
    </a>
  </p>
</template>
