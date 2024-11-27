import type { ComponentResolver } from 'unplugin-vue-components'
import { promises as fs } from 'node:fs'
import { resolveModule } from 'local-pkg'

export interface ValaxyThemesResolverOptions {
  themes: string[]
}

export interface ComponentInfo {
  path: string
  theme: string
}

const components: { [key: string]: ComponentInfo } = {}

// Helper function to format the component name
function formatComponentName(name: string) {
  return name[0].toUpperCase() + name.slice(1)
}

// Function to load components from all themes
async function loadComponents(themes: string[]) {
  if (Object.keys(components).length === 0) {
    for (const theme of themes) {
      try {
        const path = resolveModule(`valaxy-theme-${theme}/components.json`)
        if (path) {
          const indexesJson = JSON.parse(await fs.readFile(path, 'utf-8'))

          for (const [componentName, componentPath] of Object.entries(indexesJson)) {
            components[componentName] = {
              path: componentPath as string,
              theme,
            }
          }
        }
      }
      catch (error) {
        console.error(`Error loading components for theme ${theme}:`, error)
      }
    }
  }
}

export function ValaxyThemesResolver(options: ValaxyThemesResolverOptions): ComponentResolver {
  const { themes } = options

  return {
    type: 'component',
    resolve: async (name: string) => {
      const componentName = formatComponentName(name)

      await loadComponents(themes)

      // Check for existing component path
      const component = components[componentName]
      if (component) {
        const { theme, path } = component
        return {
          from: `valaxy-theme-${theme}/components/${path}`,
        }
      }

      // Fallback to dynamic resolution based on theme prefix
      for (const theme of themes) {
        if (name.toLowerCase().startsWith(theme.toLowerCase())) {
          return {
            from: `valaxy-theme-${theme}/components/${componentName}.vue`,
          }
        }
      }
    },
  }
}
