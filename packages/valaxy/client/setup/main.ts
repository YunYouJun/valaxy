/* __imports__ */

import type { ViteSSGContext } from 'vite-ssg'

export default function setupMain(ctx: ViteSSGContext) {
  // @ts-expect-error inject in runtime
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const injection_arg = ctx

  /* __injections__ */
}
