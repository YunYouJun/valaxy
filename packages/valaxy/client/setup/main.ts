/* __imports__ */
import type { ViteSSGContext } from 'vite-ssg'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'

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

  // dayjs
  dayjs.extend(relativeTime)
  dayjs.extend(timezone)

  /* __injections__ */
}
