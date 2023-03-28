/* __imports__ */
import type { ViteSSGContext } from 'vite-ssg'
import { install as installValaxy } from '../modules/valaxy'
import { install as installPinia } from '../modules/pinia'
import { install as installNprogress } from '../modules/nprogress'
import { install as installSchema } from '../modules/schemaOrg'

export default function setupMain(ctx: ViteSSGContext) {
  // @ts-expect-error inject in runtime
  // eslint-disable-next-line unused-imports/no-unused-vars
  const injection_arg = ctx

  installValaxy(ctx)

  installSchema(ctx)

  installPinia(ctx)
  installNprogress(ctx)

  /* __injections__ */
}
