import process from 'node:process'
import { init } from './valaxy'

init().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
