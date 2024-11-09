<template>
  <div class="yun-gradient-line" />
</template>

<style lang="scss">
.yun-gradient-line {
  --c-end: rgba(0 0 0 / 0);
  --c-mid: rgba(0 0 0 / 1);
}

.dark {
  .yun-gradient-line {
    --c-end: rgba(255 255 255 / 0);
    --c-mid: rgba(255 255 255 / 1);
  }
}

/* stylelint-disable-next-line no-duplicate-selectors */
.yun-gradient-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, var(--c-end) 0%, var(--c-mid) 50%, var(--c-end) 100%);
}
</style>
