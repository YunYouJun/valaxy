import { reactive } from 'vue'

/** Session drafts survive article selection and tab changes. */
export const contentDrafts = reactive(new Map<string, { content: string, baseline: string, revision: string }>())

window.addEventListener('beforeunload', (event) => {
  if ([...contentDrafts.values()].some(draft => draft.content !== draft.baseline)) {
    event.preventDefault()
    event.returnValue = ''
  }
})
