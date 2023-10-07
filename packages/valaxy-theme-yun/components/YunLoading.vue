<template>
  <div
    class="yun-page-loading"
    absolute left-0 right-0 bottom-0 top-0 flex justify="center" items-center
    z-10
    bg="$va-c-bg"
  >
    <div class="spinner" />
  </div>
</template>

<style scoped lang="scss">
.spinner {
  width: 60px;
  height: 60px;
  border: 1px solid var(--va-c-primary);
  margin: 100px auto;
  animation: rotateplane 1.2s infinite ease-in-out;
}

@keyframes rotateplane {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  }

  50% {
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  }

  100% {
    transform: perspective(120px) rotateX(-180deg) rotateY(-180deg);
  }
}
</style>
