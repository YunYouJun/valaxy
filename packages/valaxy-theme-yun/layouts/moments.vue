<script setup lang="ts">
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main>
          <div class="content yun-moments-main w-full md:w-3xl lg:w-2xl xl:w-2xl 2xl:w-4xl">
            <ValaxyMoments>
              <template #header="{ description, title }">
                <div class="yun-moments-header">
                  <YunPageHeader :title="title" />
                  <p v-if="description">
                    {{ description }}
                  </p>
                </div>
              </template>
            </ValaxyMoments>
          </div>
        </template>
      </component>
    </RouterView>

    <button
      class="xl:hidden toc-btn shadow-md fixed yun-icon-btn z-20 bg-$va-c-bg-soft"
      opacity="75" right="4" bottom="19"
      :aria-label="$t('moments.timeline')"
      @click="yun.rightSidebar.toggle()"
    >
      <div i-ri-time-line />
    </button>

    <YunOverlay :show="yun.rightSidebar.isOpen" @click="yun.rightSidebar.toggle()" />
    <YunAside>
      <ValaxyMomentsTimeline>
        <template #title="{ title }">
          <h2
            m="t-6 b-2"
            font="serif black"
          >
            {{ title }}
          </h2>
        </template>
      </ValaxyMomentsTimeline>
    </YunAside>
  </YunLayoutWrapper>
</template>

<style scoped>
.yun-moments-main {
  min-width: 0;
}

.yun-moments-header {
  padding-top: 2rem;
  margin-bottom: 1.5rem;
}

.yun-moments-header p {
  margin: -0.25rem 0 0;
  color: var(--va-c-text-2);
  text-align: center;
}
</style>
