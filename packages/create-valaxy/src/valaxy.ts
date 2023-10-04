/* eslint-disable no-console */
import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import { blue, bold, cyan, dim, green, red, reset } from 'kolorist'
import minimist from 'minimist'
import prompts from 'prompts'
import { version } from '../package.json'
import { copy, emptyDir, formatTargetDir, isEmpty, isValidPackageName, pkgFromUserAgent, toValidPackageName } from './utils'
import { TEMPLATES, TEMPLATE_CHOICES, renameFiles } from './config'

const argv = minimist(process.argv.slice(2))

const cwd = process.cwd()
const defaultTargetDir = 'valaxy-blog'

const __filename = fileURLToPath(import.meta.url)

export async function init() {
  console.log()
  console.log(`  ${bold('🌌 Valaxy')}  ${blue(`v${version}`)}`)
  console.log()

  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = argv.template || argv.t

  let targetDir = argTargetDir || defaultTargetDir
  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'packageName'
    >

  // get template
  const { template } = await prompts({
    type:
            argTemplate && TEMPLATE_CHOICES.includes(argTemplate) ? null : 'select',
    name: 'template',
    message:
            typeof argTemplate === 'string' && !TEMPLATE_CHOICES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
              )
              : reset('Select a type:'),
    initial: 0,
    choices: TEMPLATES.map((template) => {
      const tColor = template.color
      return {
        title: tColor(template.display || template.name) + dim(` - ${template.desc}`),
        value: template,
      }
    }),
  })

  try {
    result = await prompts([
      {
        type: argTargetDir ? null : 'text',
        name: 'projectName',
        message: reset(template.message),
        initial: template.initial,
        onState: (state) => {
          targetDir = formatTargetDir(template.prefix ? template.prefix + state.value : state.value) || (template.initial)
        },
      },
      {
        type: () =>
          !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm',
        name: 'overwrite',
        message: () =>
          `${targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`
            } is not empty. Remove existing files and continue?`,
      },
      {
        type: (_, { overwrite }: { overwrite?: boolean }) => {
          if (overwrite === false)
            throw new Error(`${red('✖')} Operation cancelled`)

          return null
        },
        name: 'overwriteChecker',
      },
      {
        type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
        name: 'packageName',
        message: reset('Package name:'),
        initial: () => toValidPackageName(getProjectName()),
        validate: dir =>
          isValidPackageName(dir) || 'Invalid package.json name',
      },
    ], {
      onCancel: () => {
        throw new Error(`${red('✖')} Operation cancelled`)
      },
    })
  }
  catch (cancelled: any) {
    console.log(cancelled.message)
    return
  }

  const { projectName, overwrite } = result
  const dirName = template.prefix ? template.prefix + projectName : projectName
  const root = path.join(cwd, dirName)

  if (overwrite)
    emptyDir(root)
  else if (!fs.existsSync(root))
    fs.mkdirSync(root, { recursive: true })

  // custom
  if (template.customInit) {
    await template.customInit({ themeName: projectName })
  }
  else {
    const templateDir = path.resolve(
      __filename,
      '../..',
      `template-${template.name}`,
    )

    const write = (file: string, content?: string) => {
      const targetPath = path.join(root, renameFiles[file] ?? file)
      if (content)
        fs.writeFileSync(targetPath, content)
      else
        copy(path.join(templateDir, file), targetPath)
    }

    const files = fs.readdirSync(templateDir)
    for (const file of files.filter(f => f !== 'package.json'))
      write(file)

    // write pkg name & version
    // const pkg = await import(path.join(templateDir, 'package.json'))
    const pkg = JSON.parse(
      fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
    )
    pkg.name = projectName || getProjectName()

    write('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
  }

  console.log(`  ${dim('📁')} ${dim(root)}`)
  console.log()
  console.log(dim('  Scaffolding project in ') + targetDir + dim(' ...'))

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

  const related = path.relative(cwd, root)
  console.log(green('  Done.\n'))

  // addon not start
  if (template.name === 'addon')
    return

  /**
   * @type {{ yes: boolean }}
   */
  const { yes } = await prompts({
    type: 'confirm',
    name: 'yes',
    initial: 'Y',
    message: 'Install and start it now?',
  })

  if (yes) {
    const { agent } = await prompts({
      name: 'agent',
      type: 'select',
      message: 'Choose the agent',
      choices: ['npm', 'yarn', 'pnpm'].map(i => ({ value: i, title: i })),
      initial: 2,
    })

    if (!agent)
      return

    await execa(agent, ['install'], { stdio: 'inherit', cwd: root })
    await execa(agent, ['run', 'dev'], { stdio: 'inherit', cwd: root })
  }
  else {
    console.log(dim('\n  start it later by:\n'))
    if (root !== cwd)
      console.log(`  ${green('cd')} ${blue(related)}`)

    switch (pkgManager) {
      case 'yarn':
        console.log(`  ${green('yarn')}`)
        console.log(`  ${green('yarn')} dev`)
        break
      default:
        console.log(`  ${green(pkgManager)} install`)
        console.log(`  ${green(pkgManager)} run dev`)
        break
    }
    console.log()
    console.log(`  ${cyan('✨')}`)
  }
}
