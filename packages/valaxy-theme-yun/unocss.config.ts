import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: [
    ['yun-card', 'transition-all yun-transition shadow hover:shadow-2xl'],
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
