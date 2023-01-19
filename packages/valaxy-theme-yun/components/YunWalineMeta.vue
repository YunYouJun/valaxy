<script lang="ts" setup>
import { useConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'

const route = useRoute()
const config = useConfig()

const addonWaline = computed(() => config.value.runtime.addons['valaxy-addon-waline'])

const { t } = useI18n()
</script>

<template>
  <div v-if="addonWaline && addonWaline.options" flex="~" text="sm" py="1">
    <div v-if="addonWaline.options.pageview" inline-flex justify="center" items="center" mx="2" :title="t('post.pageview_count')">
      <div inline-flex i-ri-eye-line />
      <span ml-1 inline-flex class="waline-pageview-count" :data-path="route.path" />
    </div>
    <div v-if="addonWaline.options.comment" inline-flex justify="center" items="center" mx="2" :title="t('post.comment_count')">
      <div inline-flex i-ri-chat-4-line />
      <span ml-1 inline-flex class="waline-comment-count" :data-path="route.path" />
    </div>
  </div>
</template>
