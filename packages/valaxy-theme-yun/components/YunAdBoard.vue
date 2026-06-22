<template>
  <!--
    Empty placeholder, meant to be overridden by the user (see demo/yun/components/YunAdBoard.vue).
    `v-if="false"` renders a comment node instead of a real element: this avoids the SSR hydration
    crash a raw `<template>` causes (#711), while still adding no gap to the parent flex layout,
    which an empty `<div>` would (ab57216f).
  -->
  <template v-if="false" />
</template>
