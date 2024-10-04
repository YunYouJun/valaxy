<script lang="ts" setup>
import { useRuntimeConfig } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from 'vue-i18n'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const addonWaline = computed(() => runtimeConfig.value.addons['valaxy-addon-waline'])

const { t } = useI18n()
</script>

<template>
  <div v-if="addonWaline && addonWaline.options" class="inline-flex gap-4" text="sm" h="5">
    <div
      v-if="addonWaline.options.pageview" inline-flex justify="center" items="center"
      :title="t('post.pageview_count')"
    >
      <div inline-flex i-ri-eye-line />
      <span
        ml-1 inline-flex class="waline-pageview-count op-80"
        :data-path="route.path"
      />
    </div>
    <div
      v-if="addonWaline.options.comment" inline-flex justify="center" items="center"
      :title="t('post.comment_count')"
    >
      <div inline-flex i-ri-chat-4-line />
      <span
        ml-1 inline-flex class="waline-comment-count op-80"
        :data-path="route.path"
      />
    </div>
  </div>
</template>
