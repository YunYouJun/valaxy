<template>
  <div class="press-Home">
    <slot name="home-hero-before" />
    <PressHomeHero />
    <slot name="home-hero-after" />

    <slot name="home-features-before" />
    <PressHomeFeatures />
    <slot name="home-features-after" />

    <slot>
      <router-view />
    </slot>

    <p align="center">
      <a href="https://sponsors.yunyoujun.cn">
        <img src="https://sponsors.yunyoujun.cn/sponsors.svg">
      </a>
    </p>
  </div>
</template>
