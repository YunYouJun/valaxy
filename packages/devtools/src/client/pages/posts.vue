<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { postList } from '../stores/app'
import { isStaticMode } from '../utils'

const { t } = useI18n()

onMounted(async () => {
  if (isStaticMode)
    document.title = 'Valaxy DevTools (Production)'
})
</script>

<template>
  <Splitpanes class="h-full">
    <Pane min-size="20" size="30">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold flex-1">
            {{ t('posts.title') }}
          </h3>
          <span class="text-xs op-50 tabular-nums">{{ postList.posts.length }}</span>
        </div>
        <VDPostList class="flex-1" />
      </div>
    </Pane>
    <Pane>
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold flex-1">
            {{ t('posts.detail') }}
          </h3>
        </div>
        <VDPostPanel class="flex-1 overflow-auto" />
      </div>
    </Pane>
  </Splitpanes>
</template>
