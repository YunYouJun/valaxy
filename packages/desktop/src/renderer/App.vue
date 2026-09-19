<script setup lang="ts">
import type { CreateBlogOptions } from '../shared/types'
import { shallowRef } from 'vue'
import CreateBlogDialog from './components/CreateBlogDialog.vue'
import ProjectSidebar from './components/ProjectSidebar.vue'
import ProjectWorkspace from './components/ProjectWorkspace.vue'
import { useDesktop } from './use-desktop'

const { state, actionError, busy, run, api } = useDesktop()
const creating = shallowRef(false)
async function create(options: CreateBlogOptions) {
  creating.value = false
  await run(() => api.createBlog(options))
}
async function cancelBuild() {
  try {
    await api.cancelBuild()
  }
  catch (error) { actionError.value = String(error) }
}
</script>

<template>
  <div class="desktop-layout">
    <ProjectSidebar
      :project="state.project" :recent-projects="state.recentProjects"
      :disabled="busy || state.preview === 'running'"
      @open="root => run(() => api.openProject(root))"
      @create="creating = true"
    />
    <ProjectWorkspace
      :state="state" :error="actionError || state.error" :busy="busy"
      @start="run(api.startPreview)" @stop="run(api.stopPreview)"
      @build="run(api.buildSite)" @cancel="cancelBuild"
      @output="run(api.openOutput)" @preview="run(api.openPreview)"
      @open="run(() => api.openProject())"
      @create="creating = true" @install="run(api.installDependencies)"
      @login="run(api.loginCloudflare)" @connect="(account, name) => run(() => api.connectPublishTarget(account, name))"
      @publish="run(api.publishSite)" @visit="run(api.openPublishedSite)"
    />
    <CreateBlogDialog v-if="creating" @close="creating = false" @create="create" />
  </div>
</template>
