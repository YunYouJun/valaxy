// Dedicated ports keep E2E servers separate from local development and previews.
export const ports = {
  'docs': 14859,
  'theme-yun-dev': 14860,
  'theme-yun': 14173,
  'create-valaxy': 14861,
}

// ports to env url
export const env = Object.fromEntries(
  Object.entries(ports).map(([key, value]) => [
    key,
    `http://localhost:${value}`,
  ]),
)
