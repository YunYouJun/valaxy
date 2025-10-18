<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <Layout>
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-content-after>
          <div class="prose dark:prose-invert mx-auto w-full max-w-4xl mb-4">
            <h2 :id="t('post.contributors')" class="mt-4!">
              <a :href="`#${t('post.contributors')}`" class="header-anchor" />
              <span>
                {{ t('post.contributors') }}
              </span>
            </h2>
            <GitLogContributor class="not-prose" />
          </div>
        </template>
      </component>
    </RouterView>
  </Layout>
</template>
