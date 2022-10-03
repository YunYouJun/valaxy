<script setup lang="ts">
import { ref } from 'vue'
import {
  useActiveAnchor,
  useOutline,
} from 'valaxy'
import { useThemeConfig } from '../composables'

const themeConfig = useThemeConfig()

const container = ref()
const marker = ref()

useActiveAnchor(container, marker)

const { headers } = useOutline()

function handleClick({ target: el }: Event) {
  const id = `#${(el as HTMLAnchorElement).href!.split('#')[1]}`
  const heading = document.querySelector(decodeURIComponent(id)) as HTMLAnchorElement
  heading?.focus()
}
</script>

<template>
  <div v-show="headers.length" ref="container">
    <div class="content">
      <div class="outline-title">
        {{ themeConfig.outlineTitle || 'On this page' }}
      </div>

      <div ref="marker" class="outline-marker" />

      <nav aria-labelledby="doc-outline-aria-label">
        <span id="doc-outline-aria-label" class="visually-hidden">
          Table of Contents for current page
        </span>

        <YunOutlineItem
          class="va-toc relative z-1"
          :headers="headers"
          :on-click="handleClick"
          root
        />
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-toc {
  text-align: left;
}

.content {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  text-align: left;
}

.outline-marker {
  position: absolute;
  top: 32px;
  left: -2px;
  z-index: 0;
  opacity: 0;
  width: 4px;
  height: 18px;
  background-color: var(--va-c-brand);
  transition: top 0.25s cubic-bezier(0, 1, 0.5, 1), background-color 0.5s, opacity 0.25s;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

.outline-title {
  letter-spacing: 0.4px;
  line-height: 28px;
  font-size: 14px;
  font-weight: 600;
}

.outline-link {
  display: block;
  line-height: 28px;
  color: var(--va-c-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.5s;
}

.outline-link:hover,
.outline-link.active {
  color: var(--va-c-brand);
  transition: color 0.25s;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  white-space: nowrap;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  overflow: hidden;
}
</style>
