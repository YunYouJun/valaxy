import { stripVTControlCharacters } from 'node:util'

/** Keep the real startup transcript, with machine-specific values normalized. */
export function formatOnboardingStartup(log: string, project: string, port: number) {
  const lines = stripVTControlCharacters(log).replaceAll('\\', '/').split(/\r?\n/)
  const end = lines.findIndex(line => /^\s*shortcuts\s+>/.test(line))
  if (end < 0 || !lines.slice(0, end).some(line => line.includes('server ready.')))
    throw new Error('Cannot update the startup example: no completed startup in the log')

  const output = lines.slice(0, end + 1)
    .filter(line => !/^[$>]\s|^[◐-]\s|^\s*Network\s+>|total startup:/.test(line))
    .map(line => line.replace(/\s+\d+(?:\.\d+)?(?:ms|s)\s*$/, ''))
    .join('\n')
    .replaceAll(project.replaceAll('\\', '/'), '/path/to/valaxy-blog')
    .replaceAll(`http://localhost:${port}/`, 'http://localhost:4859/')
    .replace(/(🌌 Valaxy\s+)v\S+/, '$1{{valaxyVersion}}')
    .replace(/(🪐 theme\s+>\s+yun\s+\()v[^)]+/, '$1{{themeVersion}}')
    .trimEnd()

  if (!output.includes('{{valaxyVersion}}') || !output.includes('{{themeVersion}}'))
    throw new Error('Cannot update the startup example: Valaxy or Yun version is missing')

  return `$ pnpm dev\n\n${output}\n`
}
