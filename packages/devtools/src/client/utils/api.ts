import { openFileInEditor } from '../composables/editor'
import { connectionError } from '../rpc'

export interface OpenInEditorOptions {
  file?: string
  line?: number
  column?: number
}

export async function openInEditor(options: OpenInEditorOptions = {}) {
  const { file, line, column } = options
  if (file) {
    try {
      await openFileInEditor({ path: file, line, column })
    }
    catch (error) {
      connectionError.value = String(error)
    }
  }
}
