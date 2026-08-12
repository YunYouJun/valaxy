<template>
  <YunLayoutWrapper>
    <YunDocsSidebar />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunMainHeaderAfter />
        </template>

        <template #main-content-after>
          <YunMainContentAfter />
        </template>

        <template #main-nav>
          <span hidden aria-hidden="true" />
        </template>
        <template #comment>
          <span hidden aria-hidden="true" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>
</template>
