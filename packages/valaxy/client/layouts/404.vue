<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <main class="va-main" text="center">
    <div m="4" p="10" text="yellow-600">
      <div text-6xl>
        <div i-ri-alarm-warning-line inline-block />
      </div>
      <router-view />
      <div>
        <button class="btn rounded-full" p="x-6 y-2" text="sm" m="3 t8" :title="t('button.back')" @click="router.back()">
          {{ t('button.back') }}
        </button>
      </div>
    </div>
  </main>
</template>
