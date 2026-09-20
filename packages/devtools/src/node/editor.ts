import type { KnownEditor } from 'devframe/utils/launch-editor'
import process from 'node:process'
import { KNOWN_EDITORS } from 'devframe/utils/launch-editor'

export function getEditorOptions(env: Record<string, string | undefined> = process.env) {
  const configured = env.LAUNCH_EDITOR || env.VISUAL || env.EDITOR
  return {
    editor: KNOWN_EDITORS.find(editor => editor === configured),
    editors: [...KNOWN_EDITORS] as KnownEditor[],
  }
}
