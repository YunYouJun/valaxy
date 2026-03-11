<script lang="ts" setup>
import type { ClientCollectionData } from '../types'
import { Pane, Splitpanes } from 'splitpanes'
import { ref } from 'vue'
import { collectionList } from '../stores/app'

const selectedCollection = ref<ClientCollectionData | null>(null)

function onSelectCollection(col: ClientCollectionData) {
  selectedCollection.value = col
}
</script>

<template>
  <Splitpanes class="h-full">
    <Pane min-size="20" size="30">
      <div class="h-full overflow-auto">
        <div
          v-for="col in collectionList"
          :key="col.key"
          class="cursor-pointer p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          :class="{ 'bg-gray-100 dark:bg-gray-700': selectedCollection?.key === col.key }"
          @click="onSelectCollection(col)"
        >
          <div class="font-bold text-sm">
            {{ col.title || col.key }}
          </div>
          <div class="text-xs op-50 mt-1">
            {{ col.items.length }} items
          </div>
        </div>
        <div v-if="!collectionList.length" class="text-center op-50 py-8 text-sm">
          No collections found
        </div>
      </div>
    </Pane>
    <Pane>
      <div v-if="selectedCollection" class="overflow-auto h-full p-4">
        <div class="flex items-start gap-4 mb-4">
          <img
            v-if="selectedCollection.cover"
            :src="selectedCollection.cover"
            class="max-h-30 rounded shadow"
          >
          <div>
            <h2 class="text-lg font-bold">
              {{ selectedCollection.title || selectedCollection.key }}
            </h2>
            <div class="text-xs op-50 mt-1">
              key: {{ selectedCollection.key }}
            </div>
            <div v-if="selectedCollection.description" class="text-sm op-70 mt-2">
              {{ selectedCollection.description }}
            </div>
            <div class="text-xs mt-2">
              <span
                class="px-1.5 py-0.5 rounded"
                :class="selectedCollection.collapse ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ selectedCollection.collapse ? 'collapsed' : 'expanded' }}
              </span>
            </div>
          </div>
        </div>

        <h3 class="font-bold text-sm mb-2 op-70">
          Items ({{ selectedCollection.items.length }})
        </h3>

        <div class="border rounded dark:border-gray-700">
          <div
            v-for="(item, idx) in selectedCollection.items"
            :key="item.key || item.link"
            class="flex items-center gap-2 px-3 py-2 text-sm border-b last:border-b-0 dark:border-gray-700"
          >
            <span class="op-40 text-xs w-6 text-right">{{ idx + 1 }}</span>
            <span class="flex-1">{{ item.title }}</span>
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-blue-500 font-mono inline-flex items-center gap-0.5"
            >
              {{ item.link }}
              <span class="i-ri-external-link-line text-xs" />
            </a>
            <span v-else class="text-xs op-40 font-mono">{{ item.key }}</span>
          </div>
          <div v-if="!selectedCollection.items.length" class="text-center op-50 py-4 text-sm">
            No items
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-full op-40 text-sm">
        Select a collection to view details
      </div>
    </Pane>
  </Splitpanes>
</template>
