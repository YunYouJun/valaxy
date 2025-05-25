import type { PageData, PostFrontMatter } from 'valaxy'
import type { Router } from 'vue-router'

import { ref, shallowRef } from 'vue'

export const devtoolsRouter = shallowRef<Router>()
export const activePath = ref('')

export const frontmatter = ref<PostFrontMatter>()
export const pageData = ref<PageData>()
