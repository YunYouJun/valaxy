<script setup lang="ts">
import { resolveCollectionItemHref, useCollections } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useYunCollection } from '../../composables/collection'

const { collection } = useYunCollection()
const { collections } = useCollections()
const { t } = useI18n()
const router = useRouter()
const choices = computed(() => collections.value.filter(item => item.key))
const collectionOptions = computed(() => choices.value.map(choice => ({
  value: choice.key!,
  label: choice.title || choice.name || choice.key!,
})))
const resolvedItems = computed(() => (collection.value?.items || []).map(item => ({
  ...item,
  ...resolveCollectionItemHref(collection.value!.key!, item),
})).filter(item => item.href))

const selectedKey = computed({
  get: () => collection.value?.key || '',
  set: (key: string) => {
    if (choices.value.some(item => item.key === key))
      router.push(`/collections/${key}/`)
  },
})
</script>

<template>
  <YunCard v-if="collection" class="yun-collection-sidebar p-4">
    <nav class="yun-sidebar-item w-full" :aria-label="t('theme.collectionContents')">
      <div v-if="choices.length > 1" class="collection-switcher">
        <span>{{ t('theme.switchCollection') }}</span>
        <YunSelect v-model="selectedKey" :options="collectionOptions" :aria-label="t('theme.switchCollection')" block />
      </div>
      <RouterLink :to="`/collections/${collection.key}/`" class="title">
        {{ collection.title || collection.name || collection.key }}
      </RouterLink>
      <ol class="items">
        <li v-for="item in resolvedItems" :key="item.href" class="item">
          <a v-if="item.isExternal" :href="item.href" target="_blank" rel="noopener noreferrer">
            {{ item.title || item.key || item.link }}
            <span class="i-ri-external-link-line inline-block" aria-hidden="true" />
          </a>
          <RouterLink v-else :to="item.href">
            {{ item.title || item.key || item.link }}
          </RouterLink>
        </li>
      </ol>
      <RouterLink to="/collections/" class="collection-all">
        {{ t('menu.collections') }} →
      </RouterLink>
    </nav>
  </YunCard>
</template>

<style scoped>
.yun-collection-sidebar {
  width: 100%;
  text-align: start;
}

.collection-switcher {
  display: grid;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 12px;
}

.title {
  font-weight: 600;
}

.items {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  border-left: 1px solid var(--va-c-divider);
}

.item a {
  display: block;
  padding: 8px 12px;
  overflow-wrap: anywhere;
  color: var(--va-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}

.item .router-link-exact-active {
  border-left: 2px solid var(--va-c-primary);
  margin-left: -1px;
  color: var(--va-c-primary);
  font-weight: 600;
}

.collection-all {
  font-size: 13px;
  color: var(--va-c-primary);
}

a:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 3px;
}
</style>
