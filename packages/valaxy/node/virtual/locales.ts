import type { VirtualModuleTemplate } from './types'
import fs from 'fs-extra'
import { toAtFS } from '../utils'

export const templateLocales: VirtualModuleTemplate = {
  id: '/@valaxyjs/locales',
  async getContent({ roots, config }) {
    const imports: string[] = [
      'import { createDefu } from "defu"',
      'const messages = { "zh-CN": {}, en: {} }',
      `
  const replaceArrMerge = createDefu((obj, key, value) => {
    if (key && obj[key] && Array.isArray(obj[key]) && Array.isArray(value)) {
      obj[key] = value
      return true
    }
  })
  `,
    ]
    const languages = config.siteConfig.languages || ['zh-CN', 'en']
    roots.forEach((root, i) => {
      languages.forEach((lang) => {
        const langYml = `${root}/locales/${lang}.yml`
        if (fs.existsSync(langYml) && fs.readFileSync(langYml, 'utf-8')) {
          const varName = lang.replace('-', '') + i
          imports.unshift(`import ${varName} from "${toAtFS(langYml)}"`)
          // pre override next
          imports.push(`messages['${lang}'] = replaceArrMerge(${varName}, messages['${lang}'])`)
        }
      })
    })

    imports.push('export default messages')
    return imports.join('\n')
  },
}
