import type { ValaxyDevtoolsManifest } from '../../shared/extensions'
import type { ClientCollectionData, ClientOptions, ClientPageData, ClientPostList } from '../types'
import { ref, watch } from 'vue'

export const extensions = ref<ValaxyDevtoolsManifest>({ apiVersion: 1, plugins: [] })

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
/** Live site context, independent of the article selected in the editor. */
export const inspectedPage = ref<ClientPageData>()

// --- Settings ---

export interface DevtoolsSettings {
  siteUrl: string
  sortOrder: 'updated' | 'date' | 'title'
  sortDirection: 'desc' | 'asc'
  listDensity: 'compact' | 'comfortable'
}

export const defaultSettings: DevtoolsSettings = {
  siteUrl: '',
  sortOrder: 'updated',
  sortDirection: 'desc',
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
