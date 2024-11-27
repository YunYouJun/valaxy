export * from './api'
export * from './get'
export * from './init'

export const isStaticMode = document.body.getAttribute('data-valaxy-devtools-mode') === 'BUILD'
