<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useBack } from 'valaxy'

const { t } = useI18n()
const { back } = useBack()
</script>

<template>
  <main class="va-main w-full h-screen" text="center" flex="~ col" justify="center" items="center">
    <div class="not-found" title="404" font="mono">
      404
    </div>

    <!-- <RouterView /> -->

    <div>
      <button class="btn rounded-full" p="x-6 y-2" text="sm" m="3 t8" :title="t('button.back')" @click="back">
        {{ t('button.back') }}
      </button>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.not-found {
  font-size: 10rem;
  text-shadow: 0 5px 10px rgb(0 0 0 / .25), 0 20px 20px rgb(0 0 0 / .15);
}
</style>
