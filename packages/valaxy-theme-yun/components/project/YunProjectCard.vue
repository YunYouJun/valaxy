<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ProjectItem } from '../../types'
import { TinyColor } from '@ctrl/tinycolor'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  i?: number
  project: ProjectItem
}>()

const { t } = useI18n()

const accentColor = computed(() => {
  if (!props.project.color)
    return undefined
  const color = new TinyColor(props.project.color)
  if (!color.isValid)
    return undefined
  const luminance = color.getLuminance()
  const { s } = color.toHsl()
  // Fall back to theme link color for near-white / near-black monochrome tokens.
  if (s < 0.15 && (luminance < 0.08 || luminance > 0.72))
    return undefined
  if (luminance > 0.72)
    return color.darken(24).toHexString()
  if (luminance < 0.08)
    return color.lighten(24).toHexString()
  return props.project.color
})

const showWash = computed(() => Boolean(accentColor.value) && props.project.gradient !== false)

const cardStyle = computed<CSSProperties | undefined>(() => {
  if (!accentColor.value)
    return undefined
  return {
    '--yun-project-accent': accentColor.value,
  }
})

const githubUrl = computed(() => {
  if (props.project.github)
    return `https://github.com/${props.project.github}`
  if (props.project.name)
    return `https://github.com/YunYouJun/${props.project.name}`
  return ''
})

const npmLink = computed(() => {
  return props.project.npm ? `https://www.npmjs.com/package/${props.project.npm}` : ''
})

const projectUrl = computed(() => {
  return props.project.url || githubUrl.value
})

const metaLabel = computed(() => {
  if (props.project.github)
    return props.project.github
  if (props.project.url) {
    try {
      return new URL(props.project.url).hostname
    }
    catch {
      return props.project.url
    }
  }
  return ''
})

const links = computed(() => [
  {
    url: projectUrl.value,
    icon: 'i-ri-global-line',
    color: 'var(--va-c-link)',
    label: t('theme.projectWebsite'),
  },
  {
    url: props.project.docs,
    icon: 'i-ri-book-line',
    color: '#6366f1',
    label: t('theme.projectDocs'),
  },
  {
    url: githubUrl.value,
    icon: 'i-ri-github-line',
    color: 'var(--va-c-text)',
    label: t('theme.projectGithub'),
  },
  {
    url: npmLink.value,
    icon: 'i-ri-npmjs-line',
    color: '#cb3837',
    label: t('theme.projectNpm'),
  },
])
</script>

<template>
  <article
    class="yun-project-card"
    :class="{ 'has-wash': showWash }"
    :style="cardStyle"
  >
    <div class="yun-project-card-body">
      <div class="yun-project-card-head">
        <span class="yun-project-emoji" aria-hidden="true">
          <template v-if="project.emoji">{{ project.emoji }}</template>
          <span v-else i-ri-code-s-slash-line />
        </span>
        <a
          v-if="projectUrl"
          :href="projectUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="yun-project-title"
        >
          <span>{{ project.name || '忘记叫啥了' }}</span>
          <span class="yun-project-title-arrow i-ri-arrow-right-up-line" aria-hidden="true" />
        </a>
        <h3 v-else class="yun-project-title">
          <span>{{ project.name || '忘记叫啥了' }}</span>
        </h3>
      </div>

      <p
        class="yun-project-desc"
        v-html="project.desc || '说点什么好呢'"
      />
    </div>

    <footer class="yun-project-card-footer">
      <span class="yun-project-meta" :title="metaLabel">{{ metaLabel }}</span>
      <div class="yun-project-links">
        <template v-for="item in links" :key="item.icon">
          <YunProjectLinkItem
            v-if="item.url"
            :item="item"
          />
        </template>
      </div>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.yun-project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--yun-surface-line);
  border-radius: var(--yun-project-card-radius, 0.75rem);
  background-color: var(--yun-bg-elevated, var(--va-c-bg-light));
  color: var(--va-c-text);
  text-align: left;
  transition: transform 220ms var(--yun-ease-in-out, ease), border-color 220ms ease, box-shadow 220ms ease;

  &.has-wash {
    background-image: radial-gradient(240px circle at 0% 0%, color-mix(in srgb, var(--yun-project-accent, var(--va-c-link)) 9%, transparent), transparent 72%);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: color-mix(in srgb, var(--yun-project-accent, var(--va-c-link)) 34%, var(--yun-surface-line));
      box-shadow: var(--yun-card-hover-shadow);

      @media (prefers-reduced-motion: no-preference) {
        transform: translateY(-2px);
      }

      .yun-project-title-arrow {
        color: var(--yun-project-accent, var(--va-c-link));
        opacity: 1;
        transform: translate(1px, -1px);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    .yun-project-title-arrow {
      transition: none;
    }
  }
}

.yun-project-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
}

.yun-project-card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.yun-project-emoji {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid color-mix(in srgb, var(--yun-project-accent, var(--va-c-link)) 18%, transparent);
  border-radius: 0.625rem;
  background-color: color-mix(in srgb, var(--yun-project-accent, var(--va-c-link)) 11%, transparent);
  color: var(--yun-project-accent, var(--va-c-link));
  font-size: 1.25rem;
  line-height: 1;
}

.yun-project-title {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  margin: 0;
  color: var(--va-c-text);
  font-family: var(--va-font-serif);
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.35;
  text-decoration: none;

  > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:focus-visible {
    border-radius: 0.25rem;
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }
}

.yun-project-title-arrow {
  flex-shrink: 0;
  font-size: 0.95rem;
  color: var(--va-c-text-2);
  opacity: 0.55;
  transition: color 180ms ease, opacity 180ms ease, transform 180ms ease;
}

@media (hover: hover) and (pointer: fine) {
  a.yun-project-title:hover {
    color: var(--yun-project-accent, var(--va-c-link));
  }
}

.yun-project-desc {
  margin: 0;
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.yun-project-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem 0.5rem 1.25rem;
  border-top: 1px solid var(--yun-surface-line);
}

.yun-project-meta {
  min-width: 0;
  overflow: hidden;
  color: var(--va-c-text-2);
  font-family: var(--va-font-mono);
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yun-project-links {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.125rem;
}
</style>

<style lang="scss">
html.dark .yun-project-card.has-wash {
  background-image: radial-gradient(240px circle at 0% 0%, color-mix(in srgb, var(--yun-project-accent, var(--va-c-link)) 14%, transparent), transparent 72%);
}
</style>
