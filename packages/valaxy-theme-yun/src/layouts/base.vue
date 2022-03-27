<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
const frontmatter = useFrontmatter()
</script>

<template>
  <ValaxySidebar />

  <main class="yun-main flex flex-col lt-md:ml-0">
    <div class="flex" p="l-4 lt-md:0">
      <div flex="~ 1 col" w="full">
        <YunCard m="0" p="2" class="sm:p-8 lg:px-12 xl:px-16">
          <template #content>
            <slot name="content">
              <router-view />
            </slot>
          </template>
        </YunCard>

        <slot name="nav">
          <YunPostNav v-if="frontmatter.nav !== false" />
        </slot>

        <slot v-if="frontmatter.comment !== false" name="comment">
          <YunCard w="full" p="2" class="sm:p-8 lg:px-12 xl:px-16" :class="frontmatter.nav === false ? 'mt-4' : 0">
            <YunWaline />
          </YunCard>
        </slot>
      </div>

      <slot name="right-sidebar">
        <ValaxyToc class="lt-xl:hidden" />
      </slot>
    </div>

    <ValaxyFooter>
      <slot name="footer" />
    </ValaxyFooter>
  </main>

  <YunBackToTop />
</template>
