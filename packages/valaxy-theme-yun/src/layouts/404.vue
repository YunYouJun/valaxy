<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Base from './base.vue'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <Base>
    <template #content>
      <div text="center">
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
    </template>
  </Base>
  <div>asd</div>
</template>
