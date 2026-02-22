<script setup lang="ts">
import { useCollections, useFrontmatter, useValaxyI18n } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { $tO } = useValaxyI18n()
const fm = useFrontmatter()
const { collections } = useCollections()
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header>
          <YunPageHeader
            :title="$tO(fm.title) || t('menu.collections')"
            :icon="fm.icon"
            :page-title-class="fm.pageTitleClass"
          />
        </template>

        <template #main-content>
          <div flex="~ wrap" gap="6">
            <YunCollectionItem
              v-for="collection in collections"
              :key="collection.key"
              :collection="collection"
            />
          </div>
        </template>
      </component>
    </RouterView>
  </YunLayoutWrapper>
</template>
