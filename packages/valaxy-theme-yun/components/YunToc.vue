<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFrontmatter } from '~/composables'
import {
  resolveHeaders,
  useActiveAnchor,
  useOutline,
} from '~/composables/outline'
import { useThemeConfig } from '~/config'

const route = useRoute()
const frontmatter = useFrontmatter()
const themeConfig = useThemeConfig()

const { hasOutline } = useOutline()

const { locale } = useI18n()
const container = ref()
const marker = ref()

useActiveAnchor(container, marker)

const resolvedHeaders = computed(() => {
  return resolveHeaders(route.meta.headers || [])
})

function handleClick({ target: el }: Event) {
  const id = `#${(el as HTMLAnchorElement).href!.split('#')[1]}`
  const heading = document.querySelector(decodeURIComponent(id)) as HTMLAnchorElement
  heading?.focus()
}
</script>

<template>
  <div ref="container" class="VPDocAsideOutline" :class="{ 'has-outline': hasOutline }">
    <div class="content">
      <div class="outline-title">
        {{ themeConfig.outlineTitle || 'On this page' }}
      </div>

      <div ref="marker" class="outline-marker" />

      <nav aria-labelledby="doc-outline-aria-label">
        <span id="doc-outline-aria-label" class="visually-hidden">
          Table of Contents for current page
        </span>

        <ul class="root va-toc">
          <li
            v-for="{ text, link, children, hidden, lang } in resolvedHeaders"
            v-show="!hidden"
            :key="link"
            class="va-toc-item"
            :lang="lang || locale"
          >
            <a class="outline-link" :href="link" @click="handleClick">
              {{ text }}
            </a>
            <ul v-if="children && frontmatter.outline === 'deep'">
              <li v-for="{ text, link, hidden } in children" v-show="!hidden" :key="link" :lang="lang || locale">
                <a class="outline-link nested" :href="link" @click="handleClick">
                  {{ text }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-toc {
  text-align: left;

  .va-toc-item {
    color: var(--va-c-text-light);
  }
}

.VPDocAsideOutline {
  display: none;
}

.VPDocAsideOutline.has-outline {
  display: block;
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
  color: var(--vp-c-text-2);
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

.outline-link.nested {
  padding-left: 13px;
}

.root {
  position: relative;
  z-index: 1;
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
