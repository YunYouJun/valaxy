<template>
  <ValaxySidebar :open="true" />

  <main class="yun-main flex flex-col">
    <div class="flex">
      <div class="container" flex="~ 1 col">
        <YunCard w="full" m="0" p="2">
          <template #content>
            <router-view />
          </template>
        </YunCard>

        <YunCard m="t-4" p="2">
          <YunWaline />
        </YunCard>
      </div>
      <ValaxyToc class="lt-sm:hidden" />
    </div>
  </main>

  <ValaxyFooter>
    <slot name="footer" />
  </ValaxyFooter>
</template>
