/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
// only use it in create-valaxy
import { colors } from 'consola/utils'

import { execa } from 'execa'
import minimist from 'minimist'
import prompts from 'prompts'
import { version } from '../package.json'
import { renameFiles, TEMPLATE_CHOICES, TEMPLATES } from './config'
import { copy, emptyDir, formatTargetDir, isEmpty, isValidPackageName, pkgFromUserAgent, toValidPackageName } from './utils'

const argv = minimist(process.argv.slice(2))

const cwd = process.cwd()
const defaultTargetDir = 'valaxy-blog'

const __filename = fileURLToPath(import.meta.url)

export async function init() {
  console.log()
  console.log(`  ${colors.bold('🌌 Valaxy')}  ${colors.blue(`v${version}`)}`)
  console.log()

  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = argv.template || argv.t

  /**
   * default: false
   * @type {boolean}
   */
  const argYes = argv.y || argv.yes
  const argPort = argv.port || argv.p

  let targetDir = argTargetDir || defaultTargetDir
  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'packageName'
  >

  // get template
  let template = TEMPLATES[0]

  if (!argYes) {
    const templateRes = await prompts({
      type:
              argTemplate && TEMPLATE_CHOICES.includes(argTemplate) ? null : 'select',
      name: 'template',
      message:
              typeof argTemplate === 'string' && !TEMPLATE_CHOICES.includes(argTemplate)
                ? colors.reset(
                    `"${argTemplate}" isn't a valid template. Please choose from below: `,
                  )
                : colors.reset('Select a type:'),
      initial: 0,
      choices: TEMPLATES.map((template) => {
        const tColor = template.color
        return {
          title: tColor(template.display || template.name) + colors.dim(` - ${template.desc}`),
          value: template,
        }
      }),
    })
    template = templateRes.template

    try {
      result = await prompts([
        {
          type: argTargetDir ? null : 'text',
          name: 'projectName',
          message: colors.reset(template.message),
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
              throw new Error(`${colors.red('✖')} Operation cancelled`)

            return null
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: colors.reset('Package name:'),
          initial: () => toValidPackageName(getProjectName()),
          validate: dir =>
            isValidPackageName(dir) || 'Invalid package.json name',
        },
      ], {
        onCancel: () => {
          throw new Error(`${colors.red('✖')} Operation cancelled`)
        },
      })
    }
    catch (cancelled: any) {
      console.log(cancelled.message)
      return
    }
  }
  else {
    // default
    result = {
      projectName: targetDir,
      overwrite: false,
      packageName: toValidPackageName(getProjectName()),
    }
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

  console.log(`  ${colors.dim('📁')} ${colors.dim(root)}`)
  console.log()
  console.log(colors.dim('  Scaffolding project in ') + targetDir + colors.dim(' ...'))

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

  const related = path.relative(cwd, root)
  console.log(colors.green('  Done.\n'))

  // addon not start
  if (template.name === 'addon')
    return

  let yes: boolean | undefined
  if (!argYes) {
    /**
     * @type {{ yes: boolean }}
     */
    (
      { yes } = await prompts({
        type: 'confirm',
        name: 'yes',
        initial: 'Y',
        message: 'Install and start it now?',
      })
    )
  }
  else {
    yes = false
  }

  if (yes) {
    let agent: string | undefined

    if (!argYes) {
      (
        { agent } = await prompts({
          name: 'agent',
          type: 'select',
          message: 'Choose the agent',
          choices: ['npm', 'yarn', 'pnpm'].map(i => ({ value: i, title: i })),
          initial: 2,
        })
      )
    }
    else {
      agent = 'pnpm'
    }

    if (!agent)
      return

    await execa(agent, ['install'], { stdio: 'inherit', cwd: root })
    const devArgs = argPort ? ['run', 'dev', '--port', argPort] : ['run', 'dev']
    await execa(agent, devArgs, { stdio: 'inherit', cwd: root })
  }
  else {
    console.log(colors.dim('\n  start it later by:\n'))
    if (root !== cwd)
      console.log(`  ${colors.green('cd')} ${colors.blue(related)}`)

    switch (pkgManager) {
      case 'yarn':
        console.log(`  ${colors.green('yarn')}`)
        console.log(`  ${colors.green('yarn')} dev`)
        break
      default:
        console.log(`  ${colors.green(pkgManager)} install`)
        console.log(`  ${colors.green(pkgManager)} run dev`)
        break
    }
    console.log()
    console.log(`  ${colors.cyan('✨')}`)
  }
}
