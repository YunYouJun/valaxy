<script setup lang="ts">
import type { Component } from 'vue'
import { compile, defineAsyncComponent, onMounted, shallowRef } from 'vue'

const props = withDefaults(
  defineProps<{
    templateStr: string
    data?: Record<string, any>
  }>(),
  {
    data: () => ({}),
  },
)

const dynamicComponent = shallowRef<Component | null>(null)

async function createComponent() {
  const render = compile(props.templateStr)
  const componentDefinition = {
    render,
    data: () => props.data,
  }
  dynamicComponent.value = defineAsyncComponent(() => Promise.resolve(componentDefinition))
}

onMounted(() => {
  createComponent()
})
</script>

<template>
  <component :is="dynamicComponent" />
</template>
