<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()
const { t } = useI18n()
</script>

<template>
  <div class="ai-generated-excerpt rounded-lg bg-$va-c-bg-alt p-4">
    <div font="black" flex items-center>
      <div mr-1 i-ri-robot-2-line />
      <div>
        {{ t('excerpt.ai') }}
      </div>
    </div>
    <div op="90" mt-1>
      {{ fm.excerpt }}
    </div>
  </div>
</template>
