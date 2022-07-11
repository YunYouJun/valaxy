<template>
  <Layout>
    <div class="divide-y divide-gray-200">
      <PressHeader />

      <slot>
        <router-view />
      </slot>
    </div>
  </Layout>
</template>
