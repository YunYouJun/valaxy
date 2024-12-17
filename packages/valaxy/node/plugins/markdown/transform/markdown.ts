import type { PageData } from 'valaxy/types'
import type { ResolvedValaxyOptions } from '../../../options'
import path from 'node:path'
import fs from 'fs-extra'

import { transformObject } from '../../../utils'
import { getValaxyMain } from '../../markdown/markdownToVue'

function genProvideCode(name: string, data: any) {
  return [
    `const $${name} = ${transformObject(data)}`,
    `route.meta.$${name} = $${name}`,
    `provide('valaxy:${name}', $${name})`,
  ]
}

const encryptedKeys = ['encryptedContent', 'partiallyEncryptedContents', 'encryptedPhotos']
export function injectPageDataCode(pageData: PageData) {
  const vueContextImports = [
    `import { provide } from 'vue'`,
    `import { useRoute } from 'vue-router'`,

    'const { data: pageData } = usePageData()',
    'const route = useRoute()',
    // $frontmatter contain runtime added data, will be deleted (for example, $frontmatter.partiallyEncryptedContents)
    `const $frontmatter = Object.assign(route.meta.frontmatter || {}, pageData.value.frontmatter || {})
    route.meta.frontmatter = $frontmatter

    provide('pageData', pageData.value)
    provide('valaxy:frontmatter', $frontmatter)
    `,
  ]

  for (const key of encryptedKeys) {
    if (pageData.frontmatter[key]) {
      vueContextImports.push(...genProvideCode(key, pageData.frontmatter[key]))
    }
  }
  return vueContextImports
}

export function createTransformMarkdown(options: ResolvedValaxyOptions) {
  const loaderVuePath = path.resolve(options.clientRoot, 'templates/loader.vue')
  const loaderVue = fs.readFileSync(loaderVuePath, 'utf-8')

  return (code: string, id: string, pageData: PageData) => {
    const isDev = options.mode === 'dev'
    if (!isDev) {
      // do not build path in production
      delete pageData.filePath
    }
    const dataCode = injectPageDataCode(pageData)
    const imports = [
      ...dataCode,
      isDev ? `globalThis.$pageData = pageData` : '',
      'globalThis.$frontmatter = $frontmatter',
    ]
    // remove useless frontmatter
    encryptedKeys.forEach((key) => {
      delete pageData.frontmatter[key]
    })

    const pagePath = pageData.relativePath.slice('/pages'.length - 1, -'.md'.length)
    const customDataLoader = loaderVue
      // adapt for /index
      .replace('/relativePath', pagePath.endsWith('index') ? pagePath.replace(/\/index$/, '') : pagePath)
      .replace('// custom basic loader', `return JSON.parse(\`${JSON.stringify(pageData)}\`)`)
    code = customDataLoader + code

    // inject imports to <script setup>
    const scriptSetupStart = code.indexOf('<script setup>')
    if (scriptSetupStart !== -1)
      code = code.slice(0, scriptSetupStart + '<script setup>'.length) + imports.join('\n') + code.slice(scriptSetupStart + 14)
    else
      code = `<script setup>\n${imports.join('\n')}\n</script>\n${code}`

    const injectA = code.indexOf('<template>') + '<template>'.length
    const injectB = code.lastIndexOf('</template>')
    let body = code.slice(injectA, injectB).trim()
    if (body.startsWith('<div>') && body.endsWith('</div>'))
      body = body.slice(5, -6)

    // add <ValaxyMain />
    code = `${code.slice(0, injectA)}\n${getValaxyMain(body)}\n${code.slice(injectB)}`

    return code
  }
}
