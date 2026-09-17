export const DEVTOOLS_ID = 'valaxy'
export const DEVTOOLS_PATH = '__valaxy_devtools__/'
export const DEVTOOLS_FRAME_ID = 'valaxy:main'

export function resolveDevtoolsBase(base = '/') {
  return `${base.replace(/\/$/, '')}/${DEVTOOLS_PATH}`
}

export function resolveDevtoolsLogo(base = '/') {
  return `${resolveDevtoolsBase(base)}favicon.svg`
}

export function resolveAddonBase(base = '/') {
  return `${base.replace(/\/$/, '')}/__valaxy_addons__/`
}
