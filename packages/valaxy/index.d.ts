// re-export @vueuse/shared types. with strict installers like pnpm, user won't
// be able to reference @vueuse/shared in project root.
/// <reference types="@vueuse/shared" />

export * from './client/index'
export * from './dist/node/index'
export * from './dist/types/index'
