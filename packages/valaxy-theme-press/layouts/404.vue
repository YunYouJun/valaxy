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
      <div class="not-found" title="404" font="mono">
        404
      </div>

      <RouterView />
      <RouterView />
      <div>
        <button btn text-sm m="3 t8" @click="router.back()">
          {{ t('button.back') }}
        </button>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
.not-found {
  font-size: 10rem;
  text-shadow: 0 5px 10px rgba(0,0,0,.25), 0 20px 20px rgba(0,0,0,.15);
}
</style>
