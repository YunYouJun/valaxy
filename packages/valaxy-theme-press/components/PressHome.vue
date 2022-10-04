<template>
  <div class="press-home" p="x-6">
    <slot name="home-hero-before" />
    <PressHomeHero />
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <PressHomeFeatures />
    <slot name="home-features-after" />

    <slot>
      <router-view />
    </slot>
  </div>
</template>
