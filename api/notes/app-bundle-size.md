# 包体积优化

## Data Loaders (Vue Routers)

- [Data Loaders](https://uvr.esm.is/data-loaders/)

使用 Vue Router 的 [Data Loaders](https://uvr.esm.is/data-loaders/)，按需加载对应文件的 `frontmatter`。(支持并行的数据获取)
否则初始打包会合并在一个文件中。

```vue
<script>
import { defineBasicLoader } from 'unplugin-vue-router/data-loaders/basic'

export const usePageData = defineBasicLoader('/relativePath', async (_to) => {
  // custom basic loader
}, {
  lazy: true,
})
</script>
```

```ts
export function injectPageDataCode() {
  const vueContextImports = [
    `import { provide } from 'vue'`,
    `import { useRoute } from 'vue-router'`,

    'const { data: pageData } = usePageData()',
    'const route = useRoute()',
    // $frontmatter contain runtime added data
    // for example, $frontmatter.partiallyEncryptedContents
    `const $frontmatter = Object.assign(route.meta.frontmatter || {}, pageData.value.frontmatter || {})
    route.meta.frontmatter = $frontmatter

    provide('pageData', pageData)
    provide('valaxy:frontmatter', $frontmatter)
    `,
  ]

  return vueContextImports
}

const loaderVuePath = path.resolve(options.pkgRoot, 'node/templates/loader.vue')
let loaderVue = fs.readFileSync(loaderVuePath, 'utf-8')
loaderVue = loaderVue
  .replace('/relativePath', pageData.relativePath.slice('/pages'.length - 1, -'.md'.length))
  .replace('// custom basic loader', `return ${transformObject(pageData)}`)
code = loaderVue + code
```

## manualChunks

手动分包

- 框架
- 各类库

```ts [packages/valaxy/node/build/bundle.ts]
import type {
  Rollup,
} from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import path from 'node:path'

// ref vitepress
const cache = new Map<string, boolean>()
const cacheTheme = new Map<string, boolean>()

// https://github.com/sindresorhus/escape-string-regexp/blob/ba9a4473850cb367936417e97f1f2191b7cc67dd/index.js
export function escapeRegExp(str: string) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

// https://github.com/vitejs/vite/blob/d2aa0969ee316000d3b957d7e879f001e85e369e/packages/vite/src/node/plugins/splitVendorChunk.ts#L14
// eslint-disable-next-line regexp/no-unused-capturing-group
const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/

/**
 * Check if a module is statically imported by at least one entry.
 */
export function isEagerChunk(id: string, getModuleInfo: Rollup.GetModuleInfo) {
  if (
    id.includes('node_modules')
    && !CSS_LANGS_RE.test(id)
    && staticImportedByEntry(id, getModuleInfo, cache)
  ) {
    return true
  }
}

function staticImportedByEntry(
  id: string,
  getModuleInfo: Rollup.GetModuleInfo,
  cache: Map<string, boolean>,
  entryRE: RegExp | null = null,
  importStack: string[] = [],
): boolean {
  if (cache.has(id)) {
    return !!cache.get(id)
  }
  if (importStack.includes(id)) {
    // circular deps!
    cache.set(id, false)
    return false
  }
  const mod = getModuleInfo(id)
  if (!mod) {
    cache.set(id, false)
    return false
  }

  if (entryRE ? entryRE.test(id) : mod.isEntry) {
    cache.set(id, true)
    return true
  }
  const someImporterIs = mod.importers.some((importer: string) =>
    staticImportedByEntry(
      importer,
      getModuleInfo,
      cache,
      entryRE,
      importStack.concat(id),
    ),
  )
  cache.set(id, someImporterIs)
  return someImporterIs
}

export function getRollupOptions(options: ResolvedValaxyOptions) {
  // these deps are also being used in the client code (outside of the theme)
  // exclude them from the theme chunk so there is no circular dependency
  const excludedModules = [
    '/@siteData',
    'node_modules/@vueuse/core/',
    'node_modules/@vueuse/shared/',
    'node_modules/vue/',
    'node_modules/vue-demi/',
    options.clientRoot,
  ]

  const themeEntryRE = new RegExp(
    `^${escapeRegExp(
      path.resolve(options.themeRoot, 'index.ts').replace(/\\/g, '/'),
    )}`,
  )

  const rollupOptions: Rollup.RollupOptions = {
    external: [],
    output: {
      manualChunks(id, ctx) {
        // move known framework code into a stable chunk so that
        // custom theme changes do not invalidate hash for all pages
        if (id.startsWith('\0vite')) {
          return 'framework'
        }
        if (id.includes('plugin-vue:export-helper')) {
          return 'framework'
        }
        if (
          isEagerChunk(id, ctx.getModuleInfo)
          // eslint-disable-next-line regexp/no-unused-capturing-group
          && /@vue\/(runtime|shared|reactivity)/.test(id)
        ) {
          return 'framework'
        }

        if (
          (id.startsWith(options.themeRoot)
            || !excludedModules.some(i => id.includes(i)))
          && staticImportedByEntry(
            id,
            ctx.getModuleInfo,
            cacheTheme,
            themeEntryRE,
          )
        ) {
          return 'theme'
        }

        if (id.startsWith('vue-i18n'))
          return 'vue-i18n'
      },
    },
  }
  return rollupOptions
}
```

## date-fns vs dayjs?

尽管 [date-fns](https://date-fns.org/) 支持 ESM，而 [dayjs](https://github.com/iamkun/dayjs/) 不支持 ESM。

但 Valaxy 所使用到的函数，打包分析后，date-fns 的 chunk 约为 `30KB`，而 dayjs 的 chunk 约为 `21KB`。

因此 dayjs 占用体积仍小于 date-fns，且 dayjs 全局的特性使得 API 更加简洁。
