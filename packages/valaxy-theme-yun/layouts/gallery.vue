<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@vueuse/schema-org'
import { useFrontmatter, usePostTitle } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()

const { t } = useI18n()

const frontmatter = useFrontmatter()

const title = usePostTitle(frontmatter)

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
  }),
])

const photos = computed(() => frontmatter.value.photos || [])
</script>

<template>
  <Layout>
    <template #main-header>
      <YunPageHeader
        :title="title || t('title.gallery')"
        :icon="frontmatter.icon || 'i-ri-gallery-line'"
        :color="frontmatter.color"
      />
    </template>
    <template #main-content>
      <div text="center" class="yun-text-light" p="2">
        {{ t('counter.photos', photos.length) }}
      </div>
      <div class="page-action" text="center">
        <a class="yun-icon-btn" :title="t('accessibility.back')" @click="() => router.back()">
          <div i-ri-arrow-go-back-line />
        </a>
      </div>
      <YunGallery :photos="photos" />
      <router-view />
    </template>
  </Layout>
</template>
