<script lang="ts" setup>
import type { Post } from 'valaxy'
import axios from 'axios'
import consola from 'consola'

import dayjs from 'dayjs'
import Checkbox from 'primevue/checkbox'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import { ref, toRaw } from 'vue'

import { useI18n } from 'vue-i18n'
import { activePath, pageData } from '../composables/app'
import { clientPageData } from '../stores/app'

const props = defineProps<{
  frontmatter: Post
}>()

const newFm = ref<Post>(props.frontmatter)
async function saveNewFm() {
  const res = await axios.post('/valaxy-devtools-api/frontmatter', {
    path: activePath.value,
    pageData: pageData.value,
    frontmatter: toRaw(newFm.value),
  })
  if (res)
    consola.success('Frontmatter saved')

  // console.log(res)
}
const { t } = useI18n()

const date = ref(dayjs(clientPageData.value?.frontmatter.date).toDate())
const updated = ref(dayjs(clientPageData.value?.frontmatter.updated).toDate())
</script>

<template>
  <div>
    <ul v-if="frontmatter" class="flex flex-col gap-2">
      <li
        v-for="(value, key) in frontmatter"
        :key="key"
        class="flex gap-2 text-sm min-h-8"
      >
        <div class="w-32 flex items-center h-8">
          <strong>{{ t(`frontmatter.${key}`, key as string) }}</strong>
        </div>

        <div v-if="clientPageData" class="inline-flex items-center w-full">
          <div v-if="key === 'tags'" flex="~ gap-1">
            <VDTag v-for="tag in value" :key="tag">
              {{ tag }}
            </VDTag>
          </div>
          <template v-else-if="key === 'categories'">
            <VDPostCategories :categories="value" />
          </template>
          <template v-else-if="key === 'encryptedContent'">
            [Encrypted]
          </template>
          <template v-else-if="key === 'partiallyEncryptedContents'">
            [Partially Encrypted]
          </template>
          <template v-else-if="key === 'title'">
            <!-- eslint-disable-next-line vue/no-mutating-props -->
            <!-- <AGUIInput v-model="newFm.title" /> -->
            {{ value }}
          </template>

          <template v-else-if="typeof value === 'boolean'">
            <Checkbox v-model="clientPageData.frontmatter[key]" binary />
          </template>
          <template v-else-if="key === 'cover'">
            <a :href="value" target="_blank">
              <img :src="value" class="h-20">
            </a>
          </template>
          <template v-else-if="key === 'date'">
            <DatePicker v-model="date" size="small" date-format="yy-mm-dd" show-time hour-format="24" fluid show-icon />
          </template>
          <template v-else-if="key === 'updated'">
            <DatePicker v-model="updated" size="small" date-format="yy-mm-dd" show-time hour-format="24" fluid show-icon />
          </template>

          <template v-else-if="key === 'excerpt'">
            <Textarea v-model="clientPageData.frontmatter.excerpt" rows="4" w-full auto-resize />
          </template>
          <template v-else-if="key === 'excerpt_type'">
            <VDFmExcerptType :excerpt-type="value" />
          </template>
          <template v-else>
            {{ value }}
          </template>
        </div>
      </li>
    </ul>

    <AGUIButton @click="saveNewFm">
      Save Frontmatter
    </AGUIButton>
  </div>
</template>
