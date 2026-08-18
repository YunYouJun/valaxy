<template>
  <div class="pr-nav-bar-translations" h="full">
    <PressToggleLocale />
  </div>
</template>

<style scoped>
.pr-nav-bar-translations {
  display: none;
}

@media (width >= 1024px) {
  .pr-nav-bar-translations {
    display: flex;
    align-items: center;
  }
}
</style>
