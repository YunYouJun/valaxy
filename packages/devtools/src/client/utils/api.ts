import { connectionError, rpc } from '../rpc'

export interface OpenInEditorOptions {
  file?: string
  line?: number
  column?: number
}

export async function openInEditor(options: OpenInEditorOptions = {}) {
  const { file, line = 0, column = 0 } = options
  if (file) {
    try {
      await rpc.openInEditor({ file, line, column })
    }
    catch (error) {
      connectionError.value = String(error)
    }
  }
}
