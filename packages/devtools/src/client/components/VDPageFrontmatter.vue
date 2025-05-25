<script lang="ts" setup>
import type { Post } from 'valaxy'
import axios from 'axios'
import { consola } from 'consola'

import dayjs from 'dayjs'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

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
  <div p-2>
    <ul v-if="frontmatter" class="flex flex-col gap-2">
      <VDFormItem
        v-if="clientPageData?.routePath"
        :label="t('pageData.routePath')" :value="clientPageData?.routePath"
      />
      <VDFormItem
        v-if="clientPageData?.routePath"
        :label="t('pageData.filePath')" :value="clientPageData?.filePath"
      />

      <li
        v-for="(value, key) in frontmatter"
        :key="key"
        class="flex gap-2 text-sm min-h-8"
      >
        <div class="w-32 flex items-center h-8">
          <strong>{{ t(`frontmatter.${key}`, key as string) }}</strong>
        </div>

        <div v-if="clientPageData" class="inline-flex items-center w-full min-h-8">
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
          <template v-else-if="key === 'cover'">
            <a :href="value" target="_blank">
              <img :src="value" class="max-h-20 rounded shadow">
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
            <VDFmExcerptType v-model:excerpt-type="clientPageData.frontmatter.excerpt_type" />
          </template>
          <template v-else-if="key === 'pageTitleClass'">
            <code class="px-2 py-1 bg-gray-1 rounded text-xs">
              {{ value }}
            </code>
          </template>
          <template v-else-if="key === 'password'">
            <Password v-model="clientPageData.frontmatter.password" size="small" toggle-mask />
          </template>
          <template v-else-if="typeof value === 'boolean'">
            <Checkbox v-model="clientPageData.frontmatter[key]" binary size="small" />
          </template>
          <template v-else-if="typeof value === 'number'">
            <InputNumber v-model="clientPageData.frontmatter[key]" size="small" />
          </template>
          <template v-else>
            <InputText v-model="clientPageData.frontmatter[key]" size="small" fluid />
          </template>
        </div>
      </li>
    </ul>

    <Button
      v-if="Object.keys(frontmatter).length" size="small"
      class="w-full my-3"
      @click="saveNewFm"
    >
      {{ t('button.save_frontmatter') }}
    </Button>
  </div>
</template>
