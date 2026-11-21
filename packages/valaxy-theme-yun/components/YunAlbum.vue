<script lang="ts" setup>
import type { Album } from 'valaxy'
import { onImgError } from '../utils'

defineProps<{
  album: Album
}>()
</script>

<template>
  <AppLink class="yun-album-list-item" :to="album.url" :aria-label="album.caption">
    <figure class="yun-album-card">
      <div class="yun-album-cover-wrap">
        <img
          loading="lazy"
          decoding="async"
          class="yun-album-list-cover"
          :src="album.cover"
          :alt="album.caption"
          @error="onImgError"
        >
      </div>
      <figcaption class="yun-album-info">
        <span class="yun-album-caption">{{ album.caption }}</span>
        <p v-if="album.desc" class="yun-album-desc">
          {{ album.desc }}
        </p>
      </figcaption>
    </figure>
  </AppLink>
</template>

<style lang="scss">
.yun-album-list-item {
  position: relative;
  display: block;
  padding-top: 4px;
  color: inherit;
  text-decoration: none;
  transition: transform 220ms var(--yun-ease-in-out);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    inset-inline: 0.875rem;
    height: 5px;
    border: 1px solid var(--yun-surface-line);
    border-bottom: 0;
    border-radius: 0.5rem 0.5rem 0 0;
    background-color: color-mix(in srgb, var(--yun-bg-elevated, var(--va-c-bg-light)) 65%, var(--va-c-bg-soft));
    transition: border-color 220ms ease;
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
    border-radius: 0.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &::before {
      transition: none;
    }
  }
}

.yun-album-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--yun-surface-line);
  border-radius: 0.75rem;
  background-color: var(--yun-bg-elevated, var(--va-c-bg-light));
  transition: border-color 220ms ease, box-shadow 220ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.yun-album-cover-wrap {
  aspect-ratio: 16 / 10;
  width: 100%;
  overflow: hidden;
  background-color: var(--va-c-bg-soft);
  border-bottom: 1px solid var(--yun-surface-line);
}

.yun-album-list-cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 320ms var(--yun-ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.yun-album-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem 1rem;
  text-align: left;
}

.yun-album-caption {
  color: var(--va-c-text);
  font-family: var(--va-font-serif);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  transition: color 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.yun-album-desc {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--va-c-text-2);
  font-size: 0.85rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (hover: hover) and (pointer: fine) {
  .yun-album-list-item:hover {
    @media (prefers-reduced-motion: no-preference) {
      transform: translateY(-2px);

      .yun-album-list-cover {
        transform: scale(1.03);
      }
    }

    &::before {
      border-color: color-mix(in srgb, var(--va-c-link) 24%, var(--yun-surface-line));
    }

    .yun-album-card {
      border-color: color-mix(in srgb, var(--va-c-link) 32%, var(--yun-surface-line));
      box-shadow: var(--yun-card-hover-shadow);
    }

    .yun-album-caption {
      color: var(--va-c-link);
    }
  }
}
</style>
