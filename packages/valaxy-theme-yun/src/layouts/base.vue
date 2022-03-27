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
          <YunPostNav v-if="typeof frontmatter.nav === 'undefined' || frontmatter.nav" />
        </slot>

        <slot v-if="typeof frontmatter.comment === 'undefined' || frontmatter.comment" name="comment">
          <YunCard w="full" p="2" class="sm:p-8 lg:px-12 xl:px-16">
            <YunWaline />
          </YunCard>
        </slot>
      </div>

      <slot name="right-sidebar">
        <ValaxyToc class="lt-lg:hidden" />
      </slot>
    </div>

    <ValaxyFooter>
      <slot name="footer" />
    </ValaxyFooter>
  </main>

  <YunBackToTop />
</template>
