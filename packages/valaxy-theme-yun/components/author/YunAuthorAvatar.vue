<script setup lang="ts">
import { useSiteConfig, useValaxyI18n, withBase } from 'valaxy'
import { computed } from 'vue'

const siteConfig = useSiteConfig()
const { $t } = useValaxyI18n()

const statusEmoji = computed(() => siteConfig.value.author.status?.emoji)
const statusMessage = computed(() => {
  const msg = siteConfig.value.author.status?.message
  return msg ? $t(msg) : ''
})
</script>

<template>
  <div class="relative yun-author-avatar">
    <div class="absolute size-full avatar-bg bg-image-$yun-home-hero-image-background-image filter-blur-2xl op-30" />
    <img
      class="rounded-full size-full bg-white dark:bg-white/20 p-1 m-0 absolute"
      :src="withBase(siteConfig.author.avatar)"
      alt="avatar"
      width="100" height="100"
      fetchpriority="high"
    >
    <span
      v-if="statusEmoji"
      class="site-author-status absolute"
      :class="{ 'has-message': Boolean(statusMessage) }"
    >
      <span class="site-author-status-emoji">{{ statusEmoji }}</span>
      <span v-if="statusMessage" class="site-author-status-msg-wrap">
        <span class="site-author-status-msg">{{ statusMessage }}</span>
      </span>
    </span>
  </div>
</template>

<style lang="scss">
.yun-author-avatar {
  width: var(--avatar-size, 96px);
  height: var(--avatar-size, 96px);
}

.site-author-avatar {
  img {
    box-shadow: 0 0 10px rgb(black, 0.2);
    transition: var(--va-transition-duration-moderate);

    &:hover {
      box-shadow: 0 0 30px rgb(var(--va-c-primary-rgb), 0.2);
    }
  }
}

.site-author-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  height: 1.8rem;
  min-width: 1.8rem;
  max-width: min(248px, calc(100vw - 4rem));
  padding-inline: 0.25rem;
  bottom: 0;
  left: 50%;
  transform: translateX(calc(-50% + var(--avatar-size, 96px) * 0.354));
  z-index: 2;
  line-height: 1;
  border-radius: 999px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.16);
  background-color: var(--va-c-bg-light);
  border: 1px solid var(--yun-surface-line, rgb(255 255 255 / 0.1));
  color: var(--va-c-text);
  font-size: 0.9rem;
  transition:
    transform var(--va-transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
    padding var(--va-transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow var(--va-transition-duration) ease,
    border-color var(--va-transition-duration) ease;
}

.site-author-status-emoji {
  flex: none;
  line-height: 1;
}

.site-author-status-msg-wrap {
  display: grid;
  grid-template-columns: 0fr;
  min-width: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    grid-template-columns var(--va-transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
    opacity var(--va-transition-duration-fast, 160ms) ease;
}

.site-author-status-msg {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--va-c-text-2);
  transition: padding-left var(--va-transition-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

@mixin expand-author-status {
  padding-inline: 0.45rem 0.7rem;
  transform: translateX(-50%);
  border-color: color-mix(in srgb, var(--va-c-primary) 17%, var(--yun-surface-line, transparent));
  box-shadow: 0 6px 18px -4px rgb(15 23 42 / 0.18);

  .site-author-status-msg-wrap {
    grid-template-columns: 1fr;
    opacity: 1;
  }

  .site-author-status-msg {
    padding-left: 0.35rem;
  }
}

.site-author-avatar:focus-visible .site-author-status.has-message {
  @include expand-author-status;
}

@media (hover: hover) and (pointer: fine) {
  :is(.site-author-avatar:hover, .yun-author-avatar:hover) .site-author-status.has-message {
    @include expand-author-status;
  }
}

html.dark .site-author-avatar:focus-visible .site-author-status.has-message {
  box-shadow: 0 8px 20px -4px rgb(0 0 0 / 0.45);
}

@media (hover: hover) and (pointer: fine) {
  html.dark :is(.site-author-avatar:hover, .yun-author-avatar:hover) .site-author-status.has-message {
    box-shadow: 0 8px 20px -4px rgb(0 0 0 / 0.45);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-author-avatar img,
  .site-author-status,
  .site-author-status-msg-wrap,
  .site-author-status-msg {
    transition: none;
  }
}
</style>
