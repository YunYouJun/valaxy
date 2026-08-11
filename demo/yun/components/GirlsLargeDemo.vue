<script setup lang="ts">
import type { GirlsLayout, GirlsRenderMode } from 'valaxy-addon-girls'
import ValaxyGirls from 'valaxy-addon-girls/components/ValaxyGirls.vue'
import { computed, shallowRef } from 'vue'

const GIRLS_SOURCE = 'https://wives.yunyoujun.cn/girls.json'
const layout = shallowRef<GirlsLayout>('bubbles')
const renderMode = shallowRef<GirlsRenderMode>('progressive')
const renderOptions = [
  {
    description: '首批展示 24 位，向下滚动时每次自动追加 24 位',
    label: '渐进展示',
    value: 'progressive',
  },
  {
    description: '一次创建当前数据源的全部角色节点',
    label: '全部展示',
    value: 'all',
  },
] as const satisfies readonly {
  description: string
  label: string
  value: GirlsRenderMode
}[]
const renderDescription = computed(() => {
  if (layout.value === 'bubbles')
    return '全部角色聚合在同一个圆球星团'
  if (layout.value === 'orbit')
    return '24 位进入轨道，其余角色随滚动展开'
  return renderOptions.find(option => option.value === renderMode.value)?.description || ''
})
</script>

<template>
  <section class="girls-large-demo">
    <ValaxyGirls
      v-model:layout="layout"
      :batch-size="24"
      :girls="GIRLS_SOURCE"
      :initial-count="24"
      motion="off"
      :render-mode="renderMode"
      switchable
    >
      <template #header="{ count, isLoading }">
        <div class="girls-large-demo-header">
          <div class="girls-large-demo-copy">
            <span class="girls-large-demo-kicker">100+ COLLECTION</span>
            <h2 class="girls-large-demo-title">
              完整角色名册
            </h2>
            <p class="girls-large-demo-description" aria-live="polite">
              <template v-if="isLoading">
                正在载入完整数据源…
              </template>
              <template v-else>
                当前共 {{ count }} 位 · {{ renderDescription }}
              </template>
            </p>
          </div>

          <div v-if="layout === 'grid'" class="girls-large-demo-switch" role="group" aria-label="角色列表渲染方式">
            <button
              v-for="option in renderOptions"
              :key="option.value"
              class="girls-large-demo-button"
              :class="{ 'girls-large-demo-button-active': renderMode === option.value }"
              type="button"
              :aria-pressed="renderMode === option.value"
              @click="renderMode = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </template>
    </ValaxyGirls>
  </section>
</template>

<style scoped>
.girls-large-demo {
  margin: 1rem 0 2rem;
}

.girls-large-demo-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--va-c-divider);
}

.girls-large-demo-copy {
  min-width: 0;
}

.girls-large-demo-kicker {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--va-c-primary);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.girls-large-demo-title {
  margin: 0;
  font-family: var(--va-font-serif);
  font-size: clamp(1.2rem, 3vw, 1.55rem);
  line-height: 1.25;
}

.girls-large-demo-description {
  margin: 0.3rem 0 0;
  color: var(--va-c-text-2);
  font-size: 0.72rem;
  line-height: 1.6;
}

.girls-large-demo-switch {
  display: inline-flex;
  flex: none;
  padding: 0.2rem;
  background: color-mix(in srgb, var(--va-c-bg-soft) 86%, transparent);
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
}

.girls-large-demo-button {
  min-height: 2.35rem;
  padding: 0.45rem 0.75rem;
  color: var(--va-c-text-2);
  background: transparent;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-size: 0.68rem;
  cursor: pointer;
}

.girls-large-demo-button-active {
  color: var(--va-c-primary);
  background: var(--va-c-bg-light);
  box-shadow: 0 0.2rem 0.65rem rgb(31 46 64 / 0.09);
}

.girls-large-demo-button:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 2px;
}

@media (width <= 40rem) {
  .girls-large-demo-header {
    align-items: stretch;
    flex-direction: column;
  }

  .girls-large-demo-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
