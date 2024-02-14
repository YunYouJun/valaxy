import type { PageData } from 'valaxy/types'
import { getValaxyMain } from '../../markdown/markdownToVue'
import type { ResolvedValaxyOptions } from '../../../options'
import { transformObject } from '../../../utils'

export function injectPageDataCode(
  data: PageData,
) {
  const vueContextImports = [
    `import { provide } from 'vue'`,
    `import { useRoute } from 'vue-router'`,
    `
    const data = ${transformObject(data)}
    const route = useRoute()`,

    // $frontmatter contain runtime added data
    // for example, $frontmatter.partiallyEncryptedContents
    `const $frontmatter = data.frontmatter || {}
    route.meta.frontmatter = Object.assign(route.meta.frontmatter || {}, data.frontmatter || {})
    provide('pageData', data)
    provide('valaxy:frontmatter', $frontmatter)
    `,
  ]

  return vueContextImports
}

export function createTransformMarkdown(options: ResolvedValaxyOptions) {
  return (code: string, _id: string, pageData: PageData) => {
    const dataCode = injectPageDataCode(pageData)
    const isDev = options.mode === 'dev'
    const imports = [
      ...dataCode,
      isDev
        ? `
window.$pageData = data
window.$frontmatter = $frontmatter
      `
        : '',
      'globalThis.$frontmatter = $frontmatter',
    ]

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
