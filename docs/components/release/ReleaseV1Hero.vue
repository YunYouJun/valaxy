<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'

defineProps<{ copy: ReleaseCopy['hero'], prefix: string }>()
</script>

<template>
  <section class="release-hero" aria-labelledby="release-title">
    <div class="hero-copy">
      <h1 id="release-title">
        <span>{{ copy.title[0] }}</span><span class="release-gradient">{{ copy.title[1] }}</span>
      </h1>
      <p class="hero-description">
        {{ copy.description }}
      </p>
      <div class="hero-actions">
        <RouterLink class="release-button" :to="`${prefix}/guide/getting-started`">
          {{ copy.primary }}
        </RouterLink>
        <a class="release-text-link" href="#highlights">{{ copy.secondary }} <span aria-hidden="true">›</span></a>
      </div>
    </div>
    <div class="hero-stage" :aria-label="copy.preview" role="img">
      <span class="hero-version" aria-hidden="true">1.0</span>
      <div class="hero-browser" aria-hidden="true">
        <div class="browser-bar">
          <span class="window-dots"><i /><i /><i /></span><span>your-space.valaxy</span><span>↗</span>
        </div>
        <div class="blog-preview">
          <div class="blog-nav">
            <span>Valaxy</span><span>Stories &nbsp; / &nbsp; About</span>
          </div>
          <div class="blog-body">
            <span class="blog-date">A NEW BEGINNING</span><h2>{{ copy.hello }}</h2><p>{{ copy.story }}</p>
            <div class="blog-landscape">
              <span>Words become worlds.</span>
            </div>
            <p class="blog-footnote">
              {{ copy.note }}
            </p>
          </div>
        </div>
      </div>
      <div class="hero-paper" aria-hidden="true">
        <div>⌘ &nbsp; hello.md</div><pre><code><span>---</span>
title: {{ copy.hello }}
<span>---</span>

<span># {{ copy.hello }}</span>

{{ copy.story }}

<span>&lt;MyWorld /&gt;</span></code></pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
.release-hero {
  padding-top: clamp(48px, 4.5vw, 64px);
  overflow: clip;
}

.hero-copy {
  position: relative;
  z-index: 2;
  padding: 0 22px;
  text-align: center;
}

.hero-copy h1 {
  font-size: clamp(42px, 5.5vw, 76px);
  font-weight: 700;
  line-height: 1.13;
  letter-spacing: -0.055em;
  margin: 0;
}

.hero-copy h1 span {
  display: block;
}

.hero-description {
  color: var(--release-muted);
  font-size: clamp(17px, 2vw, 24px);
  margin-top: 26px;
}

.hero-actions {
  display: flex;
  gap: 28px;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
}

.hero-stage {
  position: relative;
  width: min(1100px, 100%);
  height: 540px;
  margin: 0 auto;
}

.hero-version {
  position: absolute;
  left: 50%;
  top: -88px;
  transform: translateX(-50%) scaleX(1.5);
  font-size: 570px;
  font-weight: 750;
  letter-spacing: -0.09em;
  line-height: 1.2;
  color: transparent;
  background: var(--release-version-gradient);
  background-clip: text;
}

.hero-browser {
  position: absolute;
  top: 72px;
  left: 16%;
  width: 66%;
  border: 1px solid var(--release-border);
  border-radius: 14px;
  background: var(--release-surface);
  box-shadow: 0 20px 60px #192b4c21;
  overflow: hidden;
}

.browser-bar {
  height: 36px;
  background: var(--release-inset);
  border-bottom: 1px solid var(--release-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  color: var(--release-muted);
  font-size: 10px;
}

.window-dots {
  display: flex;
  gap: 5px;
}

.window-dots i {
  height: 7px;
  width: 7px;
  border-radius: 50%;
  background: #ff6259;
}

.window-dots i:nth-child(2) {
  background: #ffbf2f;
}

.window-dots i:nth-child(3) {
  background: #28c840;
}

.blog-nav {
  display: flex;
  justify-content: space-between;
  padding: 18px 30px;
  font-size: 11px;
}

.blog-nav span:first-child {
  font-size: 15px;
  font-weight: 650;
}

.blog-body {
  padding: 8px 30px 26px;
}

.blog-date {
  font-size: 9px;
  color: var(--release-muted);
  letter-spacing: 2px;
}

.blog-body h2 {
  font-size: 35px;
  letter-spacing: -1px;
  margin: 12px 0;
  font-weight: 650;
}

.blog-body p {
  font-size: 12px;
  color: var(--release-muted);
}

.blog-landscape {
  margin: 24px 0 18px;
  height: 126px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: var(--release-art-gradient);
  color: var(--release-art-text);
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 26px;
}

.hero-paper {
  position: absolute;
  width: 290px;
  right: 3%;
  top: 225px;
  transform: rotate(5deg);
  border: 1px solid var(--release-border);
  border-radius: 10px;
  background: var(--release-surface);
  box-shadow: 0 15px 40px #28374d21;
  font-size: 11px;
  overflow: hidden;
}

.hero-paper > div {
  padding: 14px 20px;
  background: var(--release-inset);
  color: var(--release-muted);
}

.hero-paper pre {
  padding: 22px;
  font-size: 11px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.hero-paper code span {
  color: var(--release-link);
}

@media (width <= 700px) {
  .hero-stage {
    height: 520px;
    margin-top: 28px;
  }

  .hero-version {
    top: -15px;
    font-size: 350px;
  }

  .hero-browser {
    left: 5%;
    width: 88%;
    top: 68px;
  }

  .hero-paper {
    width: 185px;
    top: 244px;
    right: 3%;
    font-size: 9px;
  }

  .hero-paper pre {
    padding: 12px;
    font-size: 9px;
  }

  .hero-paper > div {
    padding: 9px 12px;
  }

  .blog-landscape {
    height: 80px;
    font-size: 20px;
    margin: 15px 0;
  }

  .blog-body {
    padding: 5px 20px 20px;
  }

  .blog-body h2 {
    font-size: 25px;
  }

  .blog-nav {
    padding: 12px 20px;
  }

  .hero-actions {
    gap: 20px;
    font-size: 14px;
  }

  .blog-footnote {
    max-width: 45%;
  }
}
</style>
