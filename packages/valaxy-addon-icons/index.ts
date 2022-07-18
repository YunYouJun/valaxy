import { resolve } from 'path'
import { defineAddon } from 'valaxy'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import {
  SVG,
  cleanupSVG,
  deOptimisePaths,
  isEmptyColor,
  parseColors,
  runSVGO,
} from '@iconify/tools'
import { compareColors, stringToColor } from '@iconify/utils/lib/colors'
import type { IconsOptions } from '@unocss/preset-icons'

export interface IconAddonOptions {
  /**
   * The current directory to resolve
   */
  dir?: string
  /**
   * @template `i-<collection>-<icon>`
   * @template `i-<collection>:<icon>`
   * @default custom `i-custom-<icon>`
   */
  collection?: string
  /**
   * convert currentColor, clean icon
   */
  optimize?: boolean
  /**
   * @see http://github.com/unocss/unocss/tree/main/packages/preset-icons#icon-customizations
   */
  customizations?: IconsOptions['customizations']
}

const addon = defineAddon(({ options }, { userRoot }) => {
  const {
    dir = 'icons',
    collection = 'custom',
    optimize = false,
    ...customizations
  } = options

  const loader = FileSystemIconLoader(resolve(userRoot, dir), optimize ? optimizeSvg : undefined)
  return {
    unocssPresets: {
      icons: {
        collections: { [collection]: loader },
        customizations: { ...customizations },
      },
    },
  }
})

async function optimizeSvg(content: string) {
  const svg = new SVG(content)

  // Clean up and validate icon
  // This will throw an exception if icon is invalid
  await cleanupSVG(svg)

  // Change color to `currentColor`
  // Skip this step if icon has hardcoded palette
  const blackColor = stringToColor('black')!
  const whiteColor = stringToColor('white')!
  await parseColors(svg, {
    defaultColor: 'currentColor',
    callback: (attr, colorStr, color) => {
      if (!color) {
        // Color cannot be parsed!
        throw new Error(`Invalid color: "${colorStr}" in attribute ${attr}`)
      }

      if (isEmptyColor(color)) {
        // Color is empty: 'none' or 'transparent'. Return as is
        return color
      }

      // Change black to 'currentColor'
      if (compareColors(color, blackColor))
        return 'currentColor'

      // Remove shapes with white color
      if (compareColors(color, whiteColor))
        return 'remove'

      throw new Error(`Unexpected color "${colorStr}" in attribute ${attr}`)
    },
  })

  // Optimise
  await runSVGO(svg)

  // Update paths for compatibility with old software
  await deOptimisePaths(svg)

  // Get SVG string. Returned <svg> has dimensions matching viewBox, such as height="24"
  const newContent = svg.toMinifiedString()

  return newContent
}

export default addon
