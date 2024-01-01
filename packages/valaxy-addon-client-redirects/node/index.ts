import process from 'node:process'
import path from 'node:path'
import fs from 'fs-extra'
import { defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'
import type { ClientRedirectsOptions } from '../types'
import { writeRedirectFiles } from './writeRedirectFiles'
import { collectRedirects } from './utils'

export const addonClientRedirects = defineValaxyAddon<ClientRedirectsOptions>(options => ({
  name: pkg.name,
  enable: true,
  options,
  setup(node) {
    node.hook('build:after', async () => {
      const isProd = process.env.NODE_ENV === 'production'
      if (!isProd)
        return

      const outputPath = path.resolve(node.options.userRoot, 'dist')
      const redirectRules = collectRedirects(options?.redirects ?? [])

      const task = redirectRules.map(async (rule) => {
        const fromPath = path.join(outputPath, `${rule.from}.html`)
        const toPath = path.join(outputPath, `${rule.to}.html`)
        const routeExist = await fs.pathExists(toPath)
        if (!routeExist)
          throw new Error(`the route of '${rule.to}' not exists`)
        await writeRedirectFiles(rule.to, fromPath)
      })

      await Promise.all(task)
    })
  },
}))
