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
    `const $frontmatter = Object.assign(route.meta.frontmatter || {}, pageData.frontmatter || {})
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
