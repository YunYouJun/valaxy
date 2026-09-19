<template>
  <div class="press-home">
    <slot name="home-hero-before" />
    <PressHomeHero />
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <PressHomeFeatures />
    <slot name="home-features-after" />

    <slot>
      <RouterView />
    </slot>
  </div>
</template>

<style scoped>
.press-home {
  --va-code-mobile-margin-x: 0;

  width: min(100% - 48px, var(--pr-home-max-width));
  margin-inline: auto;
  border-inline: 1px solid var(--pr-c-divider-light);
}

@media (width <= 639px) {
  .press-home {
    width: calc(100% - 24px);
  }
}
</style>
