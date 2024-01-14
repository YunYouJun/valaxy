/* __imports__ */
import type { ViteSSGContext } from 'vite-ssg'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import type { ComputedRef } from 'vue'

// import type { RouteMeta } from 'vue-router'
// fix build caused by pnpm
// This is likely not portable. A type annotation is necessary.
// https://github.com/microsoft/TypeScript/issues/42873
import type { DefaultTheme, ValaxyConfig } from 'valaxy/types'

import { install as installValaxy } from '../modules/valaxy'
import { install as installPinia } from '../modules/pinia'
import { install as installNprogress } from '../modules/nprogress'
import { install as installSchema } from '../modules/schemaOrg'

// import { install as installDevtools } from '../modules/devtools'

export default function setupMain(ctx: ViteSSGContext, config: ComputedRef<ValaxyConfig<DefaultTheme.Config>>) {
  // @ts-expect-error inject in runtime
  // eslint-disable-next-line unused-imports/no-unused-vars
  const injection_arg = ctx

  installValaxy(ctx, config)
  // installDevtools(ctx)

  installSchema(ctx)

  installPinia(ctx)
  installNprogress(ctx)

  // dayjs
  dayjs.extend(relativeTime)
  dayjs.extend(utc)
  dayjs.extend(timezone)

  /* __injections__ */
}
