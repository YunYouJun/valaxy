<script lang="ts" setup>
import Layout from 'valaxy-theme-yun/layouts/layout.vue'

// override theme base(global) layout
</script>

<template>
  <Layout>
    <template #bg>
      <slot name="bg" />
    </template>
    <template #sidebar>
      <slot name="sidebar" />
    </template>
    <template #sidebar-child>
      <slot name="sidebar-child" />
    </template>
    <slot />

    <template #main-header>
      <slot name="main-header" />
    </template>

    <template #main-header-after>
      <slot name="main-header-after" />
    </template>

    <template #main>
      <slot name="main" />
    </template>

    <template #main-content>
      <slot name="main-content" />
    </template>

    <template #main-content-after>
      <slot name="main-content-after" />
    </template>

    <template #main-nav-before>
      <slot name="main-nav-before" />
    </template>

    <template #main-nav-after>
      <slot name="main-nav-after" />
    </template>

    <template #footer>
      <slot name="footer" />
      <UpyunSupport />
    </template>
    <template #aside>
      <slot name="aside" />
    </template>
    <template #aside-custom>
      <div m="10">
        <hr opacity="10" m="10">
        <p font="serif black">
          🌟 广告位招租 🌟
          <br>
          <del>云游君在线征婚</del>
        </p>
      </div>
    </template>
  </Layout>
</template>
