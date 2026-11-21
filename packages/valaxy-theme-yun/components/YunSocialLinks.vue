<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="links-of-author">
    <YunSocialLinkItem
      v-for="item, i in siteConfig.social" :key="i"
      :social="item"
    />
  </div>
</template>

<style lang="scss">
.links-of-author {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.125rem;

  .links-of-author-item.yun-icon-btn {
    width: var(--yun-action-btn-size);
    height: var(--yun-action-btn-size);
    line-height: 1;
    font-size: 0.9rem;

    .icon {
      width: 1.2rem;
      height: 1.2rem;
      color: color-mix(in srgb, currentcolor 48%, var(--yun-social-soft-base));
      transition: color var(--va-transition-duration) ease, transform var(--va-transition-duration) ease;
    }
  }

  @mixin highlight-social-link {
    background-color: color-mix(in srgb, currentcolor 13%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, currentcolor 22%, transparent);

    .icon {
      color: inherit;

      @media (prefers-reduced-motion: no-preference) {
        transform: translateY(-1px) scale(1.1);
      }

      html.dark & {
        filter: brightness(1.22);
      }
    }
  }

  .links-of-author-item.yun-icon-btn:focus-visible {
    @include highlight-social-link;

    outline-offset: 1px;
  }

  @media (hover: hover) and (pointer: fine) {
    .links-of-author-item.yun-icon-btn:hover {
      @include highlight-social-link;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .links-of-author-item.yun-icon-btn,
    .links-of-author-item.yun-icon-btn .icon {
      transition: none;
    }
  }
}
</style>
