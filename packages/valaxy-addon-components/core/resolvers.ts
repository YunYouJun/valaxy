import type { ComponentResolver } from 'unplugin-vue-components'

export interface ValaxyThemesResolverOptions {
  themes: string[]
}

export function ValaxyThemesResolver(options: ValaxyThemesResolverOptions): ComponentResolver {
  const { themes } = options
  return {
    type: 'component',
    resolve: (name: string) => {
      for (const theme of themes) {
        if (name.toLowerCase().startsWith(theme.toLowerCase())) {
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
          return {
            name: formattedName,
            path: `valaxy-theme-${theme}/components/${name.toLowerCase()}`,
            from: `valaxy-theme-${theme}`,
          }
        }
      }
    },
  }
}
