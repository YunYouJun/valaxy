import type { PageData, PostFrontMatter } from 'valaxy'
import { ref } from 'vue'

import type { Router } from 'vue-router'

export const devtoolsRouter = ref<Router>()
export const activePath = ref('')

export const frontmatter = ref<PostFrontMatter>()
export const pageData = ref<PageData>()
