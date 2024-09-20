<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <Layout>
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #default>
          <div class="prose mx-auto w-full max-w-4xl">
            <h2 :id="t('post.contributors')">
              <a :href="`#${t('post.contributors')}`" class="header-anchor" />
              {{ t('post.contributors') }}
            </h2>
            <GitLogContributor />
          </div>
        </template>
      </component>
    </RouterView>
  </Layout>
</template>
