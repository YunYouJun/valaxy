import { defineConfig } from 'unocss'

export default defineConfig({
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
