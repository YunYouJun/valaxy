<script lang="ts" setup>
import { normalizeRepositoryUrl } from '@valaxyjs/utils'
import { useSiteConfig, useValaxyConfig, useValaxyDark, useValaxyI18n } from 'valaxy'
import pkg from 'valaxy/package.json' with { type: 'json' }
import { capitalize, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../composables'

// background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
const { isDark } = useValaxyDark()
const gradientStyles = computed(() => {
  if (isDark.value) {
    return {
      '--gradient-from': '0 0 0',
      '--gradient-to': '0 0 0',
    }
  }
  return {
    '--gradient-from': '161 196 253',
    '--gradient-to': '194 233 251',
  }
})

const { t } = useI18n()
const { $t } = useValaxyI18n()
const config = useValaxyConfig()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const year = new Date().getFullYear()

const isThisYear = computed(() => {
  return year === themeConfig.value.footer.since
})

const poweredHtml = computed(() => t('footer.powered', [`<a href="${normalizeRepositoryUrl(pkg.repository.url)}" target="_blank" rel="noopener">Valaxy</a> <span class="op-60">v${pkg.version}</span>`]))
const footerIcon = computed(() => themeConfig.value.footer.icon || {
  url: normalizeRepositoryUrl(pkg.repository.url),
  name: 'i-ri-cloud-line',
  title: pkg.name,
})

const policeCode = computed(() => {
  const police = themeConfig.value.footer.beian?.police
  if (!police)
    return ''
  const match = police.match(/(\d+)/)
  return match ? match[1] : ''
})
</script>

<template>
  <footer
    flex="~ col"
    class="relative yun-footer va-footer px-4 py-4 pt-0 text-$va-c-text-light w-full mt-14"
    bg="white dark:$va-c-bg-soft"
    text="center sm"
  >
    <YunCloud v-if="themeConfig.footer.cloud?.enable" class="absolute top--10 left-0 right-0" />

    <div v-if="themeConfig.footer.beian?.enable && themeConfig.footer.beian.icp" class="beian" m="y-2">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
            {{ themeConfig.footer.beian.icp }}
        </a>

        <template v-if="themeConfig.footer.beian?.police && policeCode">
            <span mx-2>|</span>
            <a
                :href="`https://beian.mps.gov.cn/#/query/webSearch?code=${policeCode}`"
                target="_blank"
                rel="noreferrer"
                class="items-center justify-center gap-1"
            >
            <img
                src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png"
                alt="备案图标"
                class="w-4 h-4 inline-block"
            />
                {{ themeConfig.footer.beian.police }}
            </a>
        </template>
    </div>

    <div class="copyright flex justify-center items-center gap-2" p="1">
      <span>
        &copy;
        <template v-if="!isThisYear">
          {{ themeConfig.footer.since }} -
        </template>
        {{ year }}
      </span>

      <a
        v-if="themeConfig.footer.icon?.enable"
        class="inline-flex"
        :class="themeConfig.footer.icon.animated ? 'animate-pulse' : ''"
        :href="footerIcon.url"
        target="_blank"
        :title="footerIcon.title"
      >
        <div :class="footerIcon.name" />
      </a>
      <span>{{ $t(siteConfig.author.name) }}</span>
    </div>

    <div v-if="themeConfig.footer.powered" class="powered" m="2">
      <span v-html="poweredHtml" />
      <span mx-1>|</span>
      <span>
        <span>{{ t('footer.theme') }}</span>
        <span mx-1>-</span>
        <a :href="normalizeRepositoryUrl(themeConfig.pkg.repository.url)" :title="themeConfig.pkg.name" target="_blank">{{ capitalize(config.theme) }}</a>
        <span class="ml-1 op-60">v{{ themeConfig.pkg.version }}</span>
      </span>
    </div>

    <slot />

    <div class="yun-footer-gradient" :style="gradientStyles" />
  </footer>
</template>

<style lang="scss">
.yun-footer {
  letter-spacing: 0.05rem;
  line-height: 1.8;
}

.yun-footer-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 300px;
  z-index: 999;
  pointer-events: none;
  background: linear-gradient(to right,rgb(var(--gradient-from) / 0.2) 0,rgb(var(--gradient-to) / .2) 100%);
  mask-image: linear-gradient(#fff0,#000 70%);
  animation: fade-in 2s;
}
</style>