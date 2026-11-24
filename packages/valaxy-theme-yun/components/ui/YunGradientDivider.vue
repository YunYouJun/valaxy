<template>
  <div class="yun-gradient-line" />
</template>

<style lang="scss">
.yun-gradient-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--yun-divider-color, var(--yun-hr-color)) 50%,
    transparent
  );
}
</style>
