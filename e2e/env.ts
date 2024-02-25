const ports = {
  'docs': 4859,
  'theme-yun': 4860,
  'create-valaxy': 4861,
}

// ports to env url
export const env = Object.fromEntries(
  Object.entries(ports).map(([key, value]) => [
    key,
    `http://localhost:${value}`,
  ]),
)
