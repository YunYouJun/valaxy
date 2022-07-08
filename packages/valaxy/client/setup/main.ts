/* __imports__ */
import type { ViteSSGContext } from 'vite-ssg'
import { install as installValaxy } from '../modules/valaxy'
import { install as installPinia } from '../modules/pinia'
import { install as installNprogress } from '../modules/nprogress'

export default function setupMain(ctx: ViteSSGContext) {
  // @ts-expect-error inject in runtime
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const injection_arg = ctx

  installValaxy(ctx)
  installPinia(ctx)
  installNprogress(ctx)

  /* __injections__ */
}
