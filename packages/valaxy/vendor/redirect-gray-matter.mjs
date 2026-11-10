import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(new URL('../package.json', import.meta.url))
const replacement = pathToFileURL(require.resolve('@11ty/gray-matter')).href

function fromFrontmatterPlugin(parentURL = '') {
  let parent = parentURL
  try {
    parent = decodeURIComponent(parentURL)
  }
  catch {}
  return parent.includes('/@mdit-vue/plugin-frontmatter/')
    || parent.includes('@mdit-vue+plugin-frontmatter')
}

/**
 * `@mdit-vue/plugin-frontmatter` imports `gray-matter` while its module is
 * evaluated. gray-matter 4 then calls `yaml.safeLoad.bind`, which throws when
 * js-yaml 5 is the resolved copy. Redirect only that import to the fork.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'gray-matter' && fromFrontmatterPlugin(context.parentURL))
    return { url: replacement, shortCircuit: true }
  return nextResolve(specifier, context)
}
