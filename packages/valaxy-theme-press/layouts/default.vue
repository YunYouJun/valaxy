<script lang="ts" setup>
import { useSidebar } from 'valaxy/client'

const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar()
</script>

<template>
  <Layout>
    <PressSidebar :open="isSidebarOpen" />
    <PressBackdrop :show="isSidebarOpen" @click="closeSidebar" />
    <PressLocalNav :open="isSidebarOpen" @open-menu="openSidebar()" />

    <router-view />
  </Layout>
</template>
