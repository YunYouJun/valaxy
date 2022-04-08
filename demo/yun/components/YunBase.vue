<script lang="ts" setup>
import Base from 'valaxy-theme-yun/layouts/base.vue'

// override theme base(global) layout

const email = 'me@yunyoujun.cn'
</script>

<template>
  <Base>
    <template #sidebar>
      <slot name="sidebar" />
    </template>
    <template #header>
      <slot name="header" />
    </template>
    <template #content>
      <slot name="content" />
    </template>

    <slot />

    <template #nav>
      <slot name="nav" />
    </template>
    <template #comment>
      <slot name="comment" />
    </template>
    <template #footer>
      <slot name="footer" />
      <UpyunSupport />
    </template>
    <template #right-sidebar>
      <slot name="right-sidebar" />
    </template>
    <template #right-custom>
      <p p="t-4" font="serif black">
        🌟 广告位招租 🌟
        <br>
        <del>云游君在线征婚</del>
      </p>
      <a m="t-4" class="flex justify-center items-center" :href="`mailto:${email}`" :title="email" target="_blank">
        <div class="inline-flex" m="r-2" i-ri-mail-line />
        <span class="inline-flex">{{ email }}</span>
      </a>
    </template>
  </Base>
</template>
