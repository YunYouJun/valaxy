import type { DevframeNodeContext } from 'devframe'
import type { ValaxyDevtoolsOptions } from './types'
import process from 'node:process'
import { createOpenService } from '@devframes/service-open'
import { createShikiService } from '@devframes/service-shiki'
import { resolve } from 'pathe'
import { getEditorOptions } from './editor'

/** Reuse the official implementations under Valaxy-owned RPC scopes. */
export async function setupValaxyServices(ctx: DevframeNodeContext, options: ValaxyDevtoolsOptions) {
  const open = createOpenService({
    editor: getEditorOptions().editor,
    roots: [resolve(options.userRoot || process.cwd())],
  })
  const shiki = createShikiService({ langs: ['json'] })

  // These capabilities belong to this frame, so they do not participate in
  // the host's shared service installation or configuration merging.
  await open.setup(ctx.scope('valaxy:service:open'), { options: open.options })
  await shiki.setup(ctx.scope('valaxy:service:shiki'), { options: shiki.options })
}
