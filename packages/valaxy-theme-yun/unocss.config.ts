import { defineConfig } from 'unocss'
import tooltip from './styles/primevue/tooltip'

const positions = ['top', 'right', 'bottom', 'left'] as const

function getClass(val: string | Record<string, boolean> | any) {
  if (typeof val === 'string')
    return val
  if (typeof val === 'object')
    return Object.keys(val).filter(k => val[k]).join(' ')
  return ''
}

export default defineConfig({
  safelist: [
    ...positions.map(position => tooltip.root({ context: { [position]: true } }).class).map(getClass),
    ...positions.map(position => tooltip.arrow({ context: { [position]: true } }).class).map(getClass),
    ...tooltip.text.class,
  ],
  shortcuts: [
    ['yun-main', 'lt-md:pl-0'],
    ['yun-card', 'transition yun-transition shadow hover:shadow-lg'],
  ],
  rules: [
    [
      'yun-text-light',
      {
        color: 'var(--va-c-text-light)',
      },
    ],
    [
      'yun-transition',
      {
        'transition-duration': 'var(--va-transition-duration)',
      },
    ],
  ],
  // web fonts is so big, let the user decide
  presets: [],
})
