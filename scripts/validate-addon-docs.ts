import type { ValaxyAddon } from '../docs/data/addons'
import { access, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { addons, getAddonDocsPath, officialAddons } from '../docs/data/addons'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors: string[] = []

async function assertFile(path: string, label: string) {
  try {
    await access(path)
  }
  catch {
    errors.push(`${label} is missing: ${path}`)
  }
}

function docsPagePath(route: string) {
  return join(repoRoot, 'docs/pages', `${route.replace(/^\//, '')}.md`)
}

async function validateOfficialAddon(addon: ValaxyAddon) {
  if (!addon.docsPath) {
    errors.push(`${addon.name} is official but has no docsPath`)
    return
  }

  const packageDir = join(repoRoot, 'packages', addon.name)
  const englishReadme = join(packageDir, 'README.md')
  const chineseReadme = join(packageDir, 'README.zh-CN.md')
  const englishRoute = getAddonDocsPath(addon, 'en')!
  const chineseRoute = getAddonDocsPath(addon, 'zh-CN')!
  const englishPage = docsPagePath(englishRoute)
  const chinesePage = docsPagePath(chineseRoute)

  await Promise.all([
    assertFile(englishReadme, `${addon.name} English README`),
    assertFile(chineseReadme, `${addon.name} Chinese README`),
    assertFile(englishPage, `${addon.name} English docs page`),
    assertFile(chinesePage, `${addon.name} Chinese docs page`),
  ])

  try {
    const [englishSource, chineseSource] = await Promise.all([
      readFile(englishPage, 'utf8'),
      readFile(chinesePage, 'utf8'),
    ])

    if (!englishSource.includes(`/packages/${addon.name}/README.md{3,}`))
      errors.push(`${addon.name} English docs page does not include README.md`)

    if (!chineseSource.includes(`/packages/${addon.name}/README.zh-CN.md{3,}`))
      errors.push(`${addon.name} Chinese docs page does not include README.zh-CN.md`)
  }
  catch {
    // Missing files are reported above.
  }
}

async function checkRepository(url: string) {
  let lastError = 'unknown error'

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'user-agent': 'valaxy-addon-catalog-validator',
        },
        signal: AbortSignal.timeout(15_000),
      })

      if (response.ok)
        return

      lastError = `HTTP ${response.status}`
      if (response.status < 500 && response.status !== 429)
        break
    }
    catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }

  errors.push(`Repository is unavailable (${lastError}): ${url}`)
}

async function validateRepositories() {
  const monorepoPackagePrefix = 'https://github.com/YunYouJun/valaxy/tree/main/packages/'
  const repositories = [...new Set(addons.map((addon) => {
    return addon.repo.startsWith(monorepoPackagePrefix)
      ? 'https://github.com/YunYouJun/valaxy'
      : addon.repo
  }))]

  for (let index = 0; index < repositories.length; index += 4) {
    await Promise.all(repositories.slice(index, index + 4).map(checkRepository))
  }
}

function validateCatalog() {
  const names = new Set<string>()

  for (const addon of addons) {
    if (names.has(addon.name))
      errors.push(`Duplicate addon name: ${addon.name}`)

    names.add(addon.name)

    try {
      const url = new URL(addon.repo)
      if (url.protocol !== 'https:')
        errors.push(`${addon.name} repository must use HTTPS: ${addon.repo}`)
    }
    catch {
      errors.push(`${addon.name} has an invalid repository URL: ${addon.repo}`)
    }
  }
}

validateCatalog()
await Promise.all(officialAddons.map(validateOfficialAddon))
await validateRepositories()

if (errors.length) {
  console.error(`Addon catalog validation failed with ${errors.length} error(s):`)
  for (const error of errors)
    console.error(`- ${error}`)
  process.exitCode = 1
}
else {
  console.log(`Validated ${addons.length} addons, ${officialAddons.length} bilingual docs routes, and all repository URLs.`)
}
