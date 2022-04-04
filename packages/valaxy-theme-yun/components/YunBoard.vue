<template>
  <div class="yun-board">
    <slot />
  </div>
</template>

<style>
.yun-board {
  border: 1px solid var(--yun-c-text);
  width: calc(100% - 2rem);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: var(--yun-font-serif);
  font-weight: bold;
  padding: 1rem;
  margin: 1rem auto;
  max-width: var(--yun-post-card-max-width);
  background-color: rgba(200, 200, 200, 0.1);
}
</style>
