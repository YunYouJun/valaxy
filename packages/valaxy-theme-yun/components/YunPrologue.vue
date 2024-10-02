<template>
  <div class="grid-bg">
    <AEFrame />
    <AERect />

    <div
      flex="~ col"
      class="justify-center items-center absolute bottom-12 left-0 right-0"
    >
      <PrologueSocialLinks />
    </div>
  </div>
</template>

<style lang="scss">
.grid-bg {
  --size: 40px;

  background:
    linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px);
  background-size: var(--size) var(--size);
}
</style>
