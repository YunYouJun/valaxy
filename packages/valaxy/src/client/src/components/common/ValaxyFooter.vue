<template>
  <footer class="val-footer p-4 opacity-80" text="center sm">
    <div v-if="themeConfig.footer.beian.enable && themeConfig.footer.beian.icp" class="beian">
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
        {{ themeConfig.footer.beian.icp }}
      </a>
    </div>

    <div class="copyright flex justify-center items-center">
      <span>
        &copy;
        <template v-if="!isThisYear">
          {{ themeConfig.footer.since }} -
        </template>
        {{ year }}
      </span>

      <a m="x-2" class="inline-flex animate-pulse" :href="themeConfig.footer.icon.url" target="_blank" :title="themeConfig.footer.icon.title">
        <div :class="themeConfig.footer.icon.name" />
      </a>

      <span>{{ config.author.name || config.author }}</span>
    </div>

    <div v-if="themeConfig.footer.powered" class="powered" m="2">
      <span v-html="poweredHtml" /> | <span>{{ t('footer.theme') }} - <a :href="themePkg.homepage" :title="'valaxy-theme-' + config.theme" target="_blank">{{ capitalize(config.theme) }}</a> v{{ themePkg.version }}</span>
    </div>

    <slot />
  </footer>
</template>

<script lang="ts" setup>
import { capitalize, computed } from 'vue'
import { useConfig, useThemeConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'

import pkg from 'valaxy/package.json'
import themePkg from 'valaxy-theme-yun/package.json'

const { t } = useI18n()

const config = useConfig()
const themeConfig = useThemeConfig()

const year = new Date().getFullYear()

const isThisYear = computed(() => {
  return year === themeConfig.value.footer.since
})

const poweredHtml = computed(() => t('footer.powered', [`<a href="https://valaxy.yunyoujun.cn" target="_blank" rel="noopener">Valaxy</a> v${pkg.version}`]))
</script>
