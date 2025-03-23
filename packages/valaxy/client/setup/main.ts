// import type { RouteMeta } from 'vue-router'
// fix build caused by pnpm
// This is likely not portable. A type annotation is necessary.
// https://github.com/microsoft/TypeScript/issues/42873
import type { DefaultTheme, ValaxyConfig } from 'valaxy/types'
/* __imports__ */
import type { ViteSSGContext } from 'vite-ssg'

import type { ComputedRef } from 'vue'

import { consola } from 'consola'
import { install as installFloatingVue } from '../modules/floating-vue'
import { install as installNprogress } from '../modules/nprogress'
import { install as installPinia } from '../modules/pinia'
import { install as installSchema } from '../modules/schemaOrg'
import { install as installValaxy } from '../modules/valaxy'

export default function setupMain(ctx: ViteSSGContext, config: ComputedRef<ValaxyConfig<DefaultTheme.Config>>) {
  // @ts-expect-error inject in runtime
  // eslint-disable-next-line unused-imports/no-unused-vars
  const injection_arg = ctx

  installValaxy(ctx, config)
  installSchema(ctx)
  installPinia(ctx)
  installNprogress(ctx)
  installFloatingVue(ctx, config)

  if (import.meta.env.DEV && ctx.isClient) {
    import('../modules/devtools').then(({ install: installDevtools }) => {
      setTimeout(() => {
        installDevtools(ctx)
        consola.success('Valaxy Devtools installed')
      }, 0)
    })
  }

  /* __injections__ */
}
