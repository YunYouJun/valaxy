<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component">
      <template #main-content>
        <ValaxyMoments />
      </template>
    </component>
  </RouterView>
</template>
