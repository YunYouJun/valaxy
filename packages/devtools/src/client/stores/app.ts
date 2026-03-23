import type { ClientCollectionData, ClientOptions, ClientPageData, ClientPostList } from '../types'
import { ref, watch } from 'vue'

export const isDevtoolsVisible = ref(false)
/**
 * base options
 */
export const clientOptions = ref<ClientOptions>({
  userRoot: '',
})

export const postList = ref<ClientPostList>({
  posts: [],
})

export const collectionList = ref<ClientCollectionData[]>([])

export const curPost = ref('')
export const clientPageData = ref<ClientPageData>()

// --- Settings ---

export interface DevtoolsSettings {
  siteUrl: string
  sortOrder: 'updated' | 'date' | 'title'
  listDensity: 'compact' | 'comfortable'
}

export const defaultSettings: DevtoolsSettings = {
  siteUrl: 'http://localhost:4859',
  sortOrder: 'updated',
  listDensity: 'comfortable',
}

function loadSettings(): DevtoolsSettings {
  try {
    const raw = localStorage.getItem('valaxy-devtools-settings')
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings }
  }
  catch {
    return { ...defaultSettings }
  }
}

export const settings = ref<DevtoolsSettings>(loadSettings())

watch(settings, (val) => {
  localStorage.setItem('valaxy-devtools-settings', JSON.stringify(val))
}, { deep: true })
