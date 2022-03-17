<template>
  <footer class="val-footer p-8">
    <div class="mx-auto text-center opacity-60 text-sm">
      <a class="mx-1" href="https://github.com/YunYouJun" target="_blank">@YunYouJun</a>
      |
      <a class="mx-1" href="https://yunyoujun.cn" target="_blank">{{ themeConfig.banner.title }}</a>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { useThemeConfig } from 'valaxy'

const themeConfig = useThemeConfig()
</script>

<style lang="scss">
.val-footer {
  border-top: 1px solid var(--yun-border-color);
}
</style>
