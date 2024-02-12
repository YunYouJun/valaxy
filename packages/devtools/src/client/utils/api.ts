// import from @vue/devtools-api not work
import { getAppWindow } from './get'

const target = getAppWindow()

export interface OpenInEditorOptions {
  file?: string
  line?: number
  column?: number
}

export function openInEditor(options: OpenInEditorOptions = {}) {
  const { file, line = 0, column = 0 } = options
  if (file) {
    const baseUrl = window.location.origin
    target?.__VUE_INSPECTOR__.openInEditor(baseUrl, file, line, column)
  }
}
