<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <Layout>
    <template #sidebar>
      <div />
    </template>
    <div text="center" m="t-20">
      <div text-4xl>
        <div i-ri-alarm-warning-line inline-block />
      </div>
      <router-view />
      <div>
        <button btn text-sm m="3 t8" @click="router.back()">
          {{ t('button.back') }}
        </button>
      </div>
    </div>
  </Layout>
</template>
