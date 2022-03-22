<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <ValaxySidebar :open="true" />

  <main class="yun-main" text="center yellow-600 dark:gray-200">
    <YunCard p="10">
      <div text-4xl>
        <div i-ri-alarm-warning-line inline-block />
      </div>
      <router-view />
      <div>
        <button btn text-sm m="3 t8" @click="router.back()">
          {{ t('button.back') }}
        </button>
      </div>
    </YunCard>
  </main>
</template>
