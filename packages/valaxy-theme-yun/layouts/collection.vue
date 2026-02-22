<script setup lang="ts">
// TODO: Implement collection layout
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft>
      <YunCollectionSidebar />
    </YunLayoutLeft>

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunMainHeaderAfter />
        </template>
        <template #main-content-after>
          <YunMainContentAfter />
        </template>
        <template #aside-custom>
          <slot name="aside-custom" />
        </template>

        <template #main-nav>
          <!--  -->
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>
</template>
