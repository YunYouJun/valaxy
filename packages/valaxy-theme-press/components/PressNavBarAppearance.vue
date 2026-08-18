<template>
  <div class="pr-nav-bar-appearance">
    <PressSwitchAppearance />
  </div>
</template>

<style scoped>
.pr-nav-bar-appearance {
  display: none;
}

@media (width >= 1024px) {
  .pr-nav-bar-appearance {
    display: flex;
    align-items: center;
  }
}
</style>
