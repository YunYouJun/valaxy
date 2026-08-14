<script setup lang="ts">
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <main class="yun-main yun-moments-main lt-md:w-full" flex="~ center">
      <div class="content w-full md:w-3xl lg:w-2xl xl:w-2xl 2xl:w-4xl">
        <RouterView v-slot="{ Component }">
          <component :is="Component">
            <template #header="{ description, title }">
              <div class="yun-moments-header">
                <YunPageHeader :title="title" />
                <p v-if="description">
                  {{ description }}
                </p>
              </div>
            </template>
          </component>
        </RouterView>
      </div>
    </main>

    <button
      class="xl:hidden toc-btn shadow-md fixed yun-icon-btn z-20 bg-$va-c-bg-soft"
      opacity="75" right="4" bottom="19"
      :aria-label="$t('addon.moments.timeline')"
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

@media (width < 768px) {
  .yun-moments-header {
    padding-inline: 1rem;
  }
}
</style>
