export * from './init'
export * from './api'
export * from './get'

export const isStaticMode = document.body.getAttribute('data-valaxy-devtools-mode') === 'BUILD'
