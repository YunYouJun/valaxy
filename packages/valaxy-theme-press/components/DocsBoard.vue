<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <YunBoard m="t-4">
    这里是 Valaxy 的文档兼测试站点

    <ul>
      <li>
        <router-link to="/docs" :title="t('docs.view_docs')">
          {{ t('docs.view_docs') }}
        </router-link>
      </li>
      <li>
        <router-link class="flex justify-center" to="/examples">
          Examples
        </router-link>
      </li>
    </ul>
  </YunBoard>
</template>
