import { defineStore } from 'pinia'
import type { MenuItem } from 'valaxy'

export const useOutlineStore = defineStore('OutlineStore', {
  state: () => ({} as Record<string, MenuItem[]>),
})
