import { getModuleRoot } from './root'

/**
 * get theme roots
 * @param name valaxy-theme-name
 * @param entry
 */
export async function getThemeRoot(name: string, entry?: string) {
  const themeModule = (name.startsWith('valaxy-theme') || name.startsWith('.')) ? name : `valaxy-theme-${name}`
  return await getModuleRoot(themeModule, entry)
}
