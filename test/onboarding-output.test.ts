import { describe, expect, it } from 'vitest'
import { formatOnboardingStartup } from '../scripts/utils/onboarding-output'

function startup(project = '/tmp/private-blog', port = 54321) {
  return `$ valaxy --port ${port}
◐ Resolve valaxy config ...
✔ Resolve userValaxyConfig from ${project}/valaxy.config.ts 123.45ms
- Resolve addons from ${project}
✔ Resolve addons from ${project}
- [valaxy] creating server ...
\u001B[32m✔\u001B[39m [valaxy] server ready.
ℹ [valaxy] total startup: 1.23s

  🌌 Valaxy  v1.2.3

  🪐 theme   > yun (v4.5.6)
  📁 ${project}

  Preview    > http://localhost:${port}/
  Network    > http://192.168.1.2:${port}/

  shortcuts  > restart | open | qr | edit

✔ [valaxy] [HMR] ${project}/pages/posts/new.md updated in 2.00ms
`
}

describe('onboarding startup transcript', () => {
  it('keeps completed startup output without local paths, ports, timings, ANSI or later edits', () => {
    const output = formatOnboardingStartup(startup(), '/tmp/private-blog', 54321)
    expect(output).toContain('$ pnpm dev\n\n✔ Resolve userValaxyConfig from /path/to/valaxy-blog/valaxy.config.ts\n')
    expect(output).toContain('✔ [valaxy] server ready.')
    expect(output).toContain('🌌 Valaxy  {{valaxyVersion}}')
    expect(output).toContain('yun ({{themeVersion}})')
    expect(output).toContain('Preview    > http://localhost:4859/')
    for (const omitted of ['/tmp/', '54321', '192.168.', 'ms', '\u001B', 'total startup', 'creating server', '[HMR]'])
      expect(output).not.toContain(omitted)
  })

  it('produces the same example for Windows paths and CRLF logs', () => {
    const project = 'C:\\Users\\Example\\valaxy-blog'
    const log = startup(project, 65432).replaceAll('\n', '\r\n')
    expect(formatOnboardingStartup(log, project, 65432))
      .toBe(formatOnboardingStartup(startup(), '/tmp/private-blog', 54321))
  })

  it('automatically includes newly added startup messages', () => {
    const log = startup().replace('  🌌 Valaxy', '✔ New startup check completed\n\n  🌌 Valaxy')
    expect(formatOnboardingStartup(log, '/tmp/private-blog', 54321))
      .toContain('✔ New startup check completed')
  })

  it('rejects incomplete or unexpected output instead of replacing a valid example', () => {
    expect(() => formatOnboardingStartup('failed to start server', '/tmp/private-blog', 54321)).toThrow('no completed startup')
    expect(() => formatOnboardingStartup(startup().replace('🌌 Valaxy', 'missing banner'), '/tmp/private-blog', 54321))
      .toThrow('version is missing')
  })
})
