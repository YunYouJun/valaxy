import type { ResolvedValaxyOptions } from 'valaxy'
import { defineValaxyConfig } from 'valaxy'
import { mermaidMarkdown } from './node/markdown'
import { mermaidSetupPlugin } from './node/setup'

export default (options: ResolvedValaxyOptions) => defineValaxyConfig({
  markdown: {
    config: mermaidMarkdown,
  },
  vite: {
    plugins: [mermaidSetupPlugin([options.themeRoot, options.userRoot])],
  },
})
