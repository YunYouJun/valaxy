import type { VirtualModuleTemplate } from './types'
import fs from 'fs-extra'
import pascalCase from 'pascalcase'
import { join } from 'pathe'

export const templateAddons: VirtualModuleTemplate = {
  id: '/@valaxyjs/addons',
  async getContent(options) {
    const globalAddonComponents = options.addons
      .filter(v => v.global)
      .filter(v => fs.existsSync(join(v.root, './App.vue')))
    const spliceImportName = (str: string) => `Addon${pascalCase(str)}App`

    const imports = globalAddonComponents
      .map(addon => `import ${spliceImportName(addon.name)} from "${addon.name}/App.vue"`)
      .join('\n')

    const components = globalAddonComponents
      .map(addon => `{ component: ${spliceImportName(addon.name)}, props: ${JSON.stringify(addon.props)} }`)
      .join(',')

    return `${imports}\n` + `export default [${components}]`
  },
}
