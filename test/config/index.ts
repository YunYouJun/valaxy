import { resolve } from 'node:path'
import process from 'node:process'

export const demoFolder = resolve(__dirname, '../../demo')
export const demoYunDistFolder = process.env.VALAXY_TEST_YUN_DIST || resolve(demoFolder, 'yun/dist')
