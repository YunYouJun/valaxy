import type { Post } from 'valaxy'
import { reactive, toRaw } from 'vue'

interface PostDraft {
  frontmatter: Post
  baseline: string
  isSaving: boolean
}

// Session-only, shared by the article, category and archive editors. A route
// or selection change must not discard unsaved work or write it to disk.
const drafts = new Map<string, PostDraft>()

export function getPostDraft(filePath: string, source: Post): PostDraft {
  let draft = drafts.get(filePath)
  if (!draft) {
    draft = reactive({ frontmatter: structuredClone(toRaw(source)), baseline: JSON.stringify(source), isSaving: false })
    drafts.set(filePath, draft)
  }
  else if (!draft.isSaving && JSON.stringify(draft.frontmatter) === draft.baseline) {
    resetPostDraft(draft, source)
  }
  return draft
}

export function resetPostDraft(draft: PostDraft, source: Post) {
  draft.frontmatter = structuredClone(toRaw(source))
  draft.baseline = JSON.stringify(source)
}
