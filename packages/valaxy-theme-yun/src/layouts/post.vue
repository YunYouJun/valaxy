<template>
  <ValaxySidebar :open="true" />

  <main class="yun-main flex flex-col lt-md:ml-0">
    <div class="flex" p="l-4 lt-md:0">
      <div flex="~ 1 col" w="full">
        <YunCard m="0" p="2" class="sm:p-8 lg:px-12 xl:px-16">
          <template #content>
            <router-view />
          </template>
        </YunCard>

        <YunPostNav />

        <YunCard w="full" p="2" class="sm:p-8 lg:px-12 xl:px-16">
          <YunWaline />
        </YunCard>
      </div>
      <ValaxyToc class="lt-lg:hidden" />
    </div>

    <ValaxyFooter>
      <slot name="footer" />
    </ValaxyFooter>
  </main>
</template>
