<template>
  <ValaxyMoments>
    <template v-if="$slots.header" #header="headerProps">
      <slot name="header" v-bind="headerProps" />
    </template>
  </ValaxyMoments>
</template>
