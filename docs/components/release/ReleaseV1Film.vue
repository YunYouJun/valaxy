<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { computed, ref } from 'vue'

const props = defineProps<{
  /** Localized copy, poster and video-site id for the release film. */
  copy: ReleaseCopy['film']
}>()

// The film lives on video sites (Bilibili for the Chinese page, YouTube for the English
// one). Nothing from them loads until the visitor presses play.
const playing = ref(false)
const embedUrl = computed(() => {
  const id = encodeURIComponent(props.copy.id)
  if (!id)
    return ''
  return props.copy.provider === 'bilibili'
    ? `https://player.bilibili.com/player.html?bvid=${id}&autoplay=1&high_quality=1&danmaku=0`
    : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
})
</script>

<template>
  <section id="film" class="film-section release-width" aria-labelledby="film-title">
    <div class="film-intro">
      <h2 id="film-title" class="release-heading">
        <span v-for="line in copy.title" :key="line">{{ line }}</span>
      </h2>
      <p class="release-description">
        {{ copy.description }}
      </p>
    </div>
    <figure class="film-figure">
      <!-- Mounted on the night plate like the film's own frames. -->
      <div class="film-stage">
        <iframe
          v-if="playing && embedUrl"
          class="film-frame"
          :src="embedUrl"
          :title="copy.label"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowfullscreen
        />
        <button v-else-if="embedUrl" type="button" class="film-cover" :aria-label="copy.play" @click="playing = true">
          <img :src="copy.poster" alt="" width="1600" height="900" loading="lazy" decoding="async">
          <span class="film-play" aria-hidden="true"><span class="i-ri-play-fill" /></span>
        </button>
        <div v-else class="film-cover">
          <img :src="copy.poster" :alt="copy.label" width="1600" height="900" loading="lazy" decoding="async">
          <span class="film-soon">{{ copy.soon }}</span>
        </div>
      </div>
      <figcaption class="film-caption">
        <span>{{ copy.label }}</span>
        <span>{{ copy.duration }}</span>
        <span v-if="copy.note">{{ copy.note }}</span>
      </figcaption>
    </figure>
  </section>
</template>

<style scoped>
.film-section {
  padding-block: 120px 40px;
}

.film-intro {
  max-width: 640px;
}

.film-figure {
  margin: 56px 0 0;
}

.film-stage {
  padding: 12px;
  border-radius: 8px;
  background: var(--release-plate);
}

.film-cover,
.film-frame {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: 4px;
  overflow: hidden;
  background: var(--release-plate);
}

.film-cover {
  padding: 0;
  color: #eef3ff;
}

button.film-cover {
  cursor: pointer;
}

.film-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* A starlight ring with the play mark, in the corner of the plate rather than over the title.
   The icon is its own element: its mask would otherwise clip the ring. */
.film-play {
  position: absolute;
  right: 4%;
  bottom: 7%;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border: 1.5px solid #9fd3ff;
  border-radius: 50%;
  font-size: 30px;
  background: rgb(10 26 79 / 0.72);
  transition: transform 0.2s var(--release-ease, ease);
}

button.film-cover:hover .film-play,
button.film-cover:focus-visible .film-play {
  transform: scale(1.08);
}

button.film-cover:focus-visible {
  outline: 2px solid #9fd3ff;
  outline-offset: 3px;
}

.film-soon {
  position: absolute;
  right: 4%;
  bottom: 7%;
  padding: 8px 16px;
  border: 1px solid rgb(255 255 255 / 0.32);
  border-radius: 999px;
  background: rgb(10 26 79 / 0.72);
  font-size: 16px;
  font-style: italic;
}

.film-caption {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 14px;
  font-size: 14px;
  font-style: italic;
  color: var(--release-muted);
}

@media (width <= 600px) {
  .film-section {
    padding-block: 80px 24px;
  }

  .film-stage {
    padding: 6px;
  }

  .film-play {
    width: 52px;
    height: 52px;
    font-size: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .film-play {
    transition: none;
  }
}
</style>
