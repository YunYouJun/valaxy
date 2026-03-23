import type { ServerFunctions } from '../../rpc'

const API_BASE = '/valaxy-devtools-api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok)
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok)
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

export const rpc: ServerFunctions = {
  getOptions: () => get('/options'),
  getPostList: () => get('/posts'),
  getCollectionList: () => get('/collections'),
  getPageData: path => get(`/page?path=${encodeURIComponent(path)}`),
  batchUpdateFrontmatter: (filePaths, operations) =>
    post('/batch-frontmatter', { filePaths, operations }),
  getConfig: () => get('/config'),
  updateConfigField: (configType, fieldPath, value) =>
    post('/config/update', { configType, fieldPath, value }),
}
