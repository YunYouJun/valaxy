<template>
  <ValaxySidebar :open="true" />

  <main class="yun-main">
    <div class="container flex">
      <YunCard w="full" m="0" p="2">
        <router-view />
      </YunCard>

      <ValaxyToc class="lt-sm:hidden" />
    </div>
  </main>
</template>
