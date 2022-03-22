<template>
  <ValaxySidebar :open="true" />

  <main class="yun-main">
    <YunCard>
      <router-view />
    </YunCard>
  </main>
</template>
