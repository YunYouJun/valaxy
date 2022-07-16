<template>
  <nav w="full" class="press-nav relative md:fixed md:z-99 font-bold">
    <PressNavBar />
  </nav>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

.press-nav {
  z-index: var(--pr-z-index-nav);
}

@include media('md') {
  .press-nav {
    -webkit-backdrop-filter: saturate(50%) blur(8px);
    backdrop-filter: saturate(50%) blur(8px);
  }
}
</style>
