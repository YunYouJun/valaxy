<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org'
import { useFrontmatter, usePostTitle } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const frontmatter = useFrontmatter()

const title = usePostTitle(frontmatter)

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
  }),
])

const albums = computed(() => frontmatter.value.albums || [])
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header>
          <YunPageHeader
            :title="title || t('title.album')"
            :icon="frontmatter.icon || 'i-ri-gallery-line'"
            :color="frontmatter.color"
            :page-title-class="frontmatter.pageTitleClass"
          />
        </template>
        <template #main-content>
          <div text="center" class="yun-text-light" p="2">
            {{ t('counter.albums', albums.length) }}
          </div>
          <YunAlbumList :albums="albums" />
          <RouterView />
        </template>
      </component>
    </RouterView>
  </YunLayoutWrapper>

  <YunFooter />
</template>
