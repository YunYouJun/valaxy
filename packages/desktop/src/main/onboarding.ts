import type { CreateBlogOptions } from '../shared/types'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Create a portable blog from the packages shipped with this application.
 * @param parent - Parent directory selected in the native picker.
 * @param options - Blog metadata and a single directory name.
 * @param resources - Prepared desktop runtime resources.
 * @returns A new project root; existing directories are never overwritten.
 */
export async function createBlog(parent: string, options: CreateBlogOptions, resources: string): Promise<string> {
  if (!options || typeof options.directory !== 'string' || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(options.directory)
    || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(options.directory)) {
    throw new Error('目录名请使用小写字母、数字和短横线，且不要使用系统保留名称。')
  }
  for (const value of [options.title, options.author]) {
    if (typeof value !== 'string' || !value.trim() || value.length > 120)
      throw new Error('请填写 1–120 个字符的博客标题和作者。')
  }
  const packages = JSON.parse(await readFile(join(resources, 'packages.json'), 'utf8')) as Record<string, string>
  const compatibility = JSON.parse(await readFile(join(resources, 'framework-overrides.json'), 'utf8')) as Record<string, string>
  const root = join(parent, options.directory)
  await mkdir(root)
  await mkdir(join(root, 'pages/posts'), { recursive: true })
  await cp(join(resources, 'packages'), join(root, '.valaxy/desktop-packages'), { recursive: true })
  const overrides = { ...compatibility, ...Object.fromEntries(Object.entries(packages).map(([name, file]) => [name, `file:./.valaxy/desktop-packages/${file}`])) }
  await writeFile(join(root, 'package.json'), JSON.stringify({
    name: options.directory,
    version: '0.0.0',
    private: true,
    type: 'module',
    packageManager: 'pnpm@10.33.0',
    scripts: { dev: 'valaxy', build: 'valaxy build --ssg' },
    dependencies: { 'valaxy': overrides.valaxy, 'valaxy-theme-yun': overrides['valaxy-theme-yun'] },
  }, null, 2))
  await writeFile(join(root, 'pnpm-workspace.yaml'), `packages: []\nautoInstallPeers: true\nonlyBuiltDependencies:\n  - esbuild\n  - vue-demi\noverrides:\n${Object.entries(overrides).map(([name, file]) => `  ${JSON.stringify(name)}: ${JSON.stringify(file)}`).join('\n')}\n`)
  await writeFile(join(root, 'valaxy.config.ts'), `import { defineValaxyConfig } from 'valaxy'\n\nexport default defineValaxyConfig({\n  theme: 'yun',\n  themeConfig: { banner: { enable: true, title: ${JSON.stringify(options.title)} } },\n})\n`)
  await writeFile(join(root, 'site.config.ts'), `import { defineSiteConfig } from 'valaxy'\n\nexport default defineSiteConfig(${JSON.stringify({
    url: 'https://example.com/',
    lang: 'zh-CN',
    title: options.title,
    author: { name: options.author },
    description: '',
  }, null, 2)})\n`)
  await writeFile(join(root, 'pages/index.md'), '---\nlayout: home\n---\n')
  await writeFile(join(root, 'pages/posts/hello.md'), `---\ntitle: 我的第一篇文章\ndate: ${new Date().toISOString()}\n---\n\n你好，世界。\n\n在桌面工作台中打开这篇文章，开始写作吧。\n`)
  await writeFile(join(root, '.gitignore'), 'node_modules/\ndist/\n.valaxy/cache/\n')
  return root
}
