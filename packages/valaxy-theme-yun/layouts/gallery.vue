<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org'
import { useEncryptedPhotos, useFrontmatter, usePostTitle, useRuntimeConfig } from 'valaxy'
import { computed, defineAsyncComponent } from 'vue'
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

const runtimeConfig = useRuntimeConfig()

const YunGallery = runtimeConfig.value.addons['valaxy-addon-lightgallery']
  ? defineAsyncComponent(() => import('../components/YunGallery.vue'))
  : () => null

const encryptedPhotos = useEncryptedPhotos()
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header>
          <YunPageHeader
            :title="title || t('title.gallery')"
            :icon="frontmatter.icon || 'i-ri-gallery-line'"
            :color="frontmatter.color"
            :page-title-class="frontmatter.pageTitleClass"
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
          <ValaxyGalleryDecrypt v-if="encryptedPhotos" :encrypted-photos="encryptedPhotos" />
          <YunGallery v-else :photos="photos" />
          <RouterView />
        </template>
      </component>
    </RouterView>
  </YunLayoutWrapper>

  <YunFooter />
</template>
