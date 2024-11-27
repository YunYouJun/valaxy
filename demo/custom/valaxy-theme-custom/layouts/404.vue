<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <Layout>
    <template #content>
      <div text="center">
        <div text-4xl>
          <div i-ri-alarm-warning-line inline-block />
        </div>
        <RouterView />
        <div>
          <button btn text-sm m="3 t8" @click="router.back()">
            {{ t('button.back') }}
          </button>
        </div>
      </div>
    </template>
  </Layout>
</template>
