<script setup lang="ts">
withDefaults(defineProps<{
  code?: string
  label: string
}>(), {
  code: '404',
})
</script>

<template>
  <div class="not-found-visual" aria-hidden="true">
    <div class="not-found-orbit">
      <span class="not-found-satellite not-found-satellite-a" />
      <span class="not-found-satellite not-found-satellite-b" />
      <span class="not-found-satellite not-found-satellite-c" />
      <span class="not-found-signal">{{ label }}</span>
    </div>

    <div class="not-found-code" :title="code" font="mono">
      {{ code }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: clamp(280px, 42vw, 420px);
  isolation: isolate;
}

.not-found-orbit {
  position: absolute;
  width: min(100%, 360px);
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 26%, transparent);
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent) 0 2px, transparent 3px),
    radial-gradient(circle at 18% 24%, color-mix(in srgb, #f59e0b 32%, transparent) 0 3px, transparent 4px),
    radial-gradient(circle at 78% 30%, color-mix(in srgb, #14b8a6 30%, transparent) 0 2px, transparent 3px),
    radial-gradient(circle at 72% 76%, color-mix(in srgb, #ef4444 28%, transparent) 0 3px, transparent 4px);
  box-shadow:
    inset 0 0 56px color-mix(in srgb, var(--vp-c-brand-1) 9%, transparent),
    0 28px 80px color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
}

.not-found-orbit::before,
.not-found-orbit::after {
  content: "";
  position: absolute;
  inset: 12%;
  border: 1px dashed color-mix(in srgb, var(--vp-c-text-2) 22%, transparent);
  border-radius: 50%;
  transform: rotate(-22deg) scaleX(1.18);
}

.not-found-orbit::after {
  inset: 25%;
  transform: rotate(34deg) scaleX(1.35);
  border-style: solid;
  opacity: .55;
}

.not-found-satellite {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 0 6px color-mix(in srgb, currentcolor 12%, transparent);
}

.not-found-satellite-a {
  top: 18%;
  left: 67%;
  color: #f59e0b;
}

.not-found-satellite-b {
  right: 15%;
  bottom: 24%;
  color: #14b8a6;
}

.not-found-satellite-c {
  bottom: 18%;
  left: 24%;
  color: #ef4444;
}

.not-found-signal {
  position: absolute;
  right: 2%;
  bottom: 10%;
  max-width: 9rem;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.4;
  box-shadow: 0 12px 32px rgb(0 0 0 / .08);
}

.not-found-code {
  position: relative;
  z-index: 1;
  color: var(--vp-c-text-1);
  font-size: clamp(6.5rem, 18vw, 13rem);
  font-weight: 900;
  line-height: .82;
  letter-spacing: 0;
  text-shadow:
    0 1px 0 var(--vp-c-bg),
    0 14px 34px rgb(0 0 0 / .18);
}

@media (max-width: 767px) {
  .not-found-visual {
    min-height: 205px;
  }

  .not-found-orbit {
    width: min(76vw, 245px);
  }

  .not-found-code {
    font-size: clamp(5.25rem, 27vw, 7rem);
  }

  .not-found-signal {
    right: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .not-found-satellite-a {
    animation: not-found-float 5s ease-in-out infinite;
  }

  .not-found-satellite-b {
    animation: not-found-float 6s ease-in-out .8s infinite;
  }

  .not-found-satellite-c {
    animation: not-found-float 5.5s ease-in-out .35s infinite;
  }
}

@keyframes not-found-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -10px, 0);
  }
}
</style>
