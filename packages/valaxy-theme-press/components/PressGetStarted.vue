<script setup lang="ts">
import { useSiteConfig, withBase } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  theme: 'brand' | 'alt'
  link: string
  text: string
}>()

const { t } = useI18n()
const siteConfig = useSiteConfig()
const iconStyle = computed(() => ({
  maskImage: `url("${withBase(siteConfig.value.favicon)}")`,
}))
</script>

<template>
  <PressButton
    class="press-get-started"
    :theme="theme"
    :link="link"
    :text="text"
  >
    <div class="flex justify-center items-center">
      <div class="svg-wrapper">
        <div class="icon" :style="iconStyle" />
      </div>
      <span>
        {{ t(text) }}
      </span>
    </div>
  </PressButton>
</template>

<style scoped>
.press-get-started .svg-wrapper {
  display: inline-flex;
  margin-right: 8px;
}

.press-get-started .icon {
  width: 18px;
  height: 18px;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  background-color: currentcolor;
  transition: transform 0.25s;
}

.press-get-started:hover .icon {
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .press-get-started .icon { transition: none; }
  .press-get-started:hover .icon { transform: none; }
}
</style>
