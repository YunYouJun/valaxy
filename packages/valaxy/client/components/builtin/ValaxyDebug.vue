<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useFrontmatter } from '../../composables/common'
import { useScreenSize } from '../../composables/helper/useScreenSize'
import { useLayout } from '../../composables/layout'
import { useSiteConfig, useThemeConfig } from '../../config'
import ValaxySvgLogo from '../ValaxySvgLogo.vue'

const show = ref(true)
const expanded = ref<Record<string, boolean>>({
  breakpoints: true,
  route: false,
  frontmatter: false,
  config: false,
})

function toggleSection(key: string) {
  expanded.value[key] = !expanded.value[key]
}

// Breakpoints
const screenSize = useScreenSize()
const breakpoints = computed(() => [
  { label: 'xs', value: screenSize.isXs.value },
  { label: 'sm', value: screenSize.isSm.value },
  { label: 'md', value: screenSize.isMd.value },
  { label: 'lg', value: screenSize.isLg.value },
  { label: 'xl', value: screenSize.isXl.value },
  { label: '2xl', value: screenSize.is2xl.value },
])

// Route
const route = useRoute()
const routeInfo = computed(() => ({
  path: route.path,
  name: route.name as string,
  layout: route.meta?.layout || 'default',
  query: Object.keys(route.query).length ? route.query : undefined,
  params: Object.keys(route.params).length ? route.params : undefined,
}))

// Frontmatter
const frontmatter = useFrontmatter()
const fmSummary = computed(() => {
  const fm = frontmatter.value
  if (!fm || !Object.keys(fm).length)
    return null
  return fm
})

// Config
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const layout = useLayout()

const configSummary = computed(() => ({
  theme: siteConfig.value.lang ? undefined : undefined,
  lang: siteConfig.value.lang,
  title: siteConfig.value.title,
  url: siteConfig.value.url,
  layout: layout.value,
}))
</script>

<template>
  <div
    v-if="show"
    class="valaxy-debug fixed bottom-4 left-2 z-9999 max-h-[80vh] w-72 overflow-y-auto rounded-lg bg-black/80 p-3 text-xs text-white shadow-lg backdrop-blur-sm"
    @click.stop
  >
    <!-- Header -->
    <div class="mb-2 flex items-center justify-between border-b border-white/20 pb-2">
      <span class="flex items-center gap-1 font-bold text-cyan-400">
        <ValaxySvgLogo class="size-4" />
        Valaxy Debug
      </span>
      <button
        class="rounded px-1 text-white/60 transition hover:bg-white/20 hover:text-white"
        title="Close"
        @click="show = false"
      >
        ✕
      </button>
    </div>

    <!-- Breakpoints -->
    <div class="mb-1">
      <button
        class="w-full rounded px-1 py-0.5 text-left font-bold text-emerald-400 transition hover:bg-white/10"
        @click="toggleSection('breakpoints')"
      >
        {{ expanded.breakpoints ? '▾' : '▸' }} Breakpoints
      </button>
      <div v-if="expanded.breakpoints" class="mt-1 flex flex-wrap gap-1 pl-3">
        <span
          v-for="bp in breakpoints"
          :key="bp.label"
          class="rounded px-1.5 py-0.5"
          :class="bp.value ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/5 text-white/40'"
        >
          {{ bp.label }}
        </span>
      </div>
    </div>

    <!-- Route -->
    <div class="mb-1">
      <button
        class="w-full rounded px-1 py-0.5 text-left font-bold text-blue-400 transition hover:bg-white/10"
        @click="toggleSection('route')"
      >
        {{ expanded.route ? '▾' : '▸' }} Route
      </button>
      <div v-if="expanded.route" class="mt-1 space-y-0.5 pl-3">
        <div><span class="text-white/50">path:</span> {{ routeInfo.path }}</div>
        <div><span class="text-white/50">name:</span> {{ routeInfo.name }}</div>
        <div><span class="text-white/50">layout:</span> {{ routeInfo.layout }}</div>
        <div v-if="routeInfo.query">
          <span class="text-white/50">query:</span> {{ JSON.stringify(routeInfo.query) }}
        </div>
        <div v-if="routeInfo.params">
          <span class="text-white/50">params:</span> {{ JSON.stringify(routeInfo.params) }}
        </div>
      </div>
    </div>

    <!-- Frontmatter -->
    <div class="mb-1">
      <button
        class="w-full rounded px-1 py-0.5 text-left font-bold text-amber-400 transition hover:bg-white/10"
        @click="toggleSection('frontmatter')"
      >
        {{ expanded.frontmatter ? '▾' : '▸' }} Frontmatter
      </button>
      <div v-if="expanded.frontmatter" class="mt-1 pl-3">
        <pre v-if="fmSummary" class="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-white/5 p-1.5 text-white/80">{{ JSON.stringify(fmSummary, null, 2) }}</pre>
        <span v-else class="text-white/40">No frontmatter</span>
      </div>
    </div>

    <!-- Config -->
    <div class="mb-1">
      <button
        class="w-full rounded px-1 py-0.5 text-left font-bold text-purple-400 transition hover:bg-white/10"
        @click="toggleSection('config')"
      >
        {{ expanded.config ? '▾' : '▸' }} Config
      </button>
      <div v-if="expanded.config" class="mt-1 space-y-2 pl-3">
        <div>
          <div class="mb-0.5 text-white/50">
            Site Config
          </div>
          <pre class="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-white/5 p-1.5 text-white/80">{{ JSON.stringify(configSummary, null, 2) }}</pre>
        </div>
        <div>
          <div class="mb-0.5 text-white/50">
            Theme Config
          </div>
          <pre class="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-white/5 p-1.5 text-white/80">{{ JSON.stringify(themeConfig, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>

  <!-- Collapsed toggle button -->
  <button
    v-if="!show"
    class="fixed bottom-4 left-2 z-9999 rounded-lg bg-black/60 px-2 py-1 text-xs text-white/60 shadow-lg backdrop-blur-sm transition hover:bg-black/80 hover:text-white"
    title="Open Valaxy Debug"
    @click="show = true"
  >
    <ValaxySvgLogo class="size-4" />
  </button>
</template>
