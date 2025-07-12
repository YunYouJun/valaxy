<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteConfig } from '../config'

withDefaults(defineProps<{
  url?: string
}>(), {
  url: '',
})

const { t, locale } = useI18n()

const siteConfig = useSiteConfig()

const ccVersion = (siteConfig.value.license.type === 'zero') ? '1.0' : '4.0'
const ccPrefix = (siteConfig.value.license.type === 'zero') ? 'publicdomain' : 'licenses'
const ccURL = computed(() => {
  const ccLang = siteConfig.value.license.language ? siteConfig.value.license.language : (locale.value === 'zh-CN') ? 'zh' : 'en'
  return `https://creativecommons.org/${ccPrefix}/${siteConfig.value.license.type}/${ccVersion}/deed.${ccLang}`
})

const licenseHtml = computed(() => {
  return t('post.copyright.license_content', [`<a href="${ccURL.value}" target="_blank" rel="noopener" title="CC ${`${siteConfig.value.license.type.toUpperCase()} ${ccVersion}`} ">CC ${siteConfig.value.license.type.toUpperCase()}</a>`])
})
</script>

<template>
  <ul class="post-copyright">
    <li class="post-copyright-author">
      <strong>
        {{ t('post.copyright.author') + t('symbol.colon') }}
      </strong>
      <span>{{ t(siteConfig.author.name) }}</span>
    </li>
    <li v-if="url" class="post-copyright-link">
      <strong>
        {{ t('post.copyright.link') + t('symbol.colon') }}
      </strong>
      <a :href="url" target="_blank" :title="t('post.copyright.link')">
        {{ decodeURI(url) }}
      </a>
    </li>
    <li class="post-copyright-license">
      <strong>
        {{ t('post.copyright.license_title') + t('symbol.colon') }}
      </strong>
      <span v-html="licenseHtml" />
    </li>
  </ul>
</template>

<style lang="scss">
.post-copyright {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-left: 4px solid var(--va-c-primary);
  background-color: var(--va-c-bg-dark);
  list-style: none;
  word-break: break-all;
  position: relative;
  overflow: hidden;

  &::after {
    pointer-events: none;
    position: absolute;
    color: white;
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512'%3E%3Cpath fill='gray' d='M245.8 214.9l-33.2 17.3c-9.4-19.6-25.2-20-27.4-20-22.2 0-33.3 14.6-33.3 43.9 0 23.5 9.2 43.8 33.3 43.8 14.4 0 24.6-7 30.5-21.3l30.6 15.5a73.2 73.2 0 01-65.1 39c-22.6 0-74-10.3-74-77 0-58.7 43-77 72.6-77 30.8-.1 52.7 11.9 66 35.8zm143 0l-32.7 17.3c-9.5-19.8-25.7-20-27.9-20-22.1 0-33.2 14.6-33.2 43.9 0 23.5 9.2 43.8 33.2 43.8 14.5 0 24.7-7 30.5-21.3l31 15.5c-2 3.8-21.3 39-65 39-22.7 0-74-9.9-74-77 0-58.7 43-77 72.6-77C354 179 376 191 389 214.8zM247.7 8C104.7 8 0 123 0 256c0 138.4 113.6 248 247.6 248C377.5 504 496 403 496 256 496 118 389.4 8 247.6 8zm.8 450.8c-112.5 0-203.7-93-203.7-202.8 0-105.5 85.5-203.3 203.8-203.3A201.7 201.7 0 01451.3 256c0 121.7-99.7 202.9-202.9 202.9z'/%3E%3C/svg%3E");
    content: ' ';
    height: 10rem;
    width: 10rem;
    right: -2rem;
    top: -2rem;
    opacity: 0.1;
  }
}
</style>
