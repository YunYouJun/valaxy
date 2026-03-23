import type { ServerFunctions } from '../../rpc'

const API_BASE = '/valaxy-devtools-api'

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    ...(body != null && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  })
  if (!res.ok)
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, 'GET')
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, 'POST', body)
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, 'PUT', body)
}

export const rpc: ServerFunctions = {
  getOptions: () => get('/options'),
  getPostList: () => get('/posts'),
  getCollectionList: () => get('/collections'),
  getPageData: path => get(`/pages?path=${encodeURIComponent(path)}`),
  updateFrontmatter: req =>
    post('/frontmatter', req),
  batchUpdateFrontmatter: (filePaths, operations) =>
    post('/frontmatter/batch', { filePaths, operations }),
  getConfig: () => get('/config'),
  updateConfigField: (configType, fieldPath, value) =>
    put('/config', { configType, fieldPath, value }),
  runMigration: (filePaths, frontmatter) =>
    post('/migration', { filePaths, frontmatter }),
  createPost: options =>
    post('/posts', options),
}
