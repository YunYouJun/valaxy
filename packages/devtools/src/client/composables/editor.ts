import type { OpenInEditorInput } from '@devframes/service-open'
import { computed } from 'vue'
import { editorPresentations, getEditorPresentation } from '../../shared/editors'
import { getClient } from '../rpc'
import { clientOptions, settings } from '../stores/app'

const supportedEditors = computed(() => clientOptions.value.editors || [])
export const editorPreference = computed({
  get: () => settings.value.editor && supportedEditors.value.includes(settings.value.editor) ? settings.value.editor : '',
  set: value => settings.value.editor = value,
})
export const editorChoices = computed(() => editorPresentations.flatMap((item) => {
  // Preserve a configured alias while avoiding duplicate brands in the menu.
  const command = item.commands.find(command => command === editorPreference.value)
    || item.commands.find(command => supportedEditors.value.includes(command))
  return command ? [{ ...item, command }] : []
}))
export const activeEditor = computed(() => editorPreference.value || clientOptions.value.editor)
export const activeEditorPresentation = computed(() => getEditorPresentation(activeEditor.value))
export const defaultEditorPresentation = computed(() => getEditorPresentation(clientOptions.value.editor))

export async function openFileInEditor(input: Omit<OpenInEditorInput, 'editor'>) {
  await (await getClient()).call('valaxy:service:open:open-in-editor', { ...input, editor: activeEditor.value })
}
