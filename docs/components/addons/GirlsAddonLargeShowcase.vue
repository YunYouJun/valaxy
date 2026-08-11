<script setup lang="ts">
import type { GirlsLayout, GirlsRenderMode } from 'valaxy-addon-girls'
import ValaxyGirls from 'valaxy-addon-girls/components/ValaxyGirls.vue'
import { computed, shallowRef } from 'vue'

const props = withDefaults(defineProps<{
  locale?: 'en' | 'zh-CN'
}>(), {
  locale: 'en',
})

const GIRLS_SOURCE = 'https://wives.yunyoujun.cn/girls.json'
const layout = shallowRef<GirlsLayout>('bubbles')
const renderMode = shallowRef<GirlsRenderMode>('progressive')
const isZh = computed(() => props.locale === 'zh-CN')
const title = computed(() => isZh.value ? '100+ 完整角色名册' : '100+ complete collection')
const renderOptions = computed(() => [
  {
    description: isZh.value ? '首批 24 位，滚动时自动追加 24 位' : '24 initially, then 24 more automatically while scrolling',
    label: isZh.value ? '渐进展示' : 'Progressive',
    value: 'progressive',
  },
  {
    description: isZh.value ? '一次创建全部角色节点' : 'Create every character node at once',
    label: isZh.value ? '全部展示' : 'Render all',
    value: 'all',
  },
] satisfies { description: string, label: string, value: GirlsRenderMode }[])
const renderDescription = computed(() => {
  if (layout.value === 'bubbles')
    return isZh.value ? '全部角色聚合在同一个圆球星团' : 'Every character is packed into one bubble cluster'
  if (layout.value === 'orbit')
    return isZh.value ? '24 位进入轨道，其余角色随滚动展开' : '24 on the orbit, with the remainder revealed while scrolling'
  return renderOptions.value.find(option => option.value === renderMode.value)?.description || ''
})
const modeLabel = computed(() => isZh.value ? '角色列表渲染方式' : 'Character list rendering mode')
</script>

<template>
  <section class="girls-addon-large-showcase">
    <ValaxyGirls
      v-model:layout="layout"
      :auto-load="true"
      :batch-size="24"
      :girls="GIRLS_SOURCE"
      :initial-count="24"
      motion="off"
      :render-mode="renderMode"
      switchable
    >
      <template #header="{ count, isLoading }">
        <div class="girls-addon-large-showcase-header">
          <div class="girls-addon-large-showcase-copy">
            <span class="girls-addon-large-showcase-kicker">LIVE DATA</span>
            <h3 class="girls-addon-large-showcase-title">
              {{ title }}
            </h3>
            <p class="girls-addon-large-showcase-description" aria-live="polite">
              <template v-if="isLoading">
                {{ isZh ? '正在加载数据…' : 'Loading collection…' }}
              </template>
              <template v-else>
                {{ count }} · {{ renderDescription }}
              </template>
            </p>
          </div>

          <div v-if="layout === 'grid'" class="girls-addon-large-showcase-switch" role="group" :aria-label="modeLabel">
            <button
              v-for="option in renderOptions"
              :key="option.value"
              class="girls-addon-large-showcase-button"
              :class="{ 'girls-addon-large-showcase-button-active': renderMode === option.value }"
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
.girls-addon-large-showcase {
  margin: 1rem 0 2rem;
  padding: clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--va-c-divider);
  border-radius: 0.9rem;
}

.girls-addon-large-showcase-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--va-c-divider);
}

.girls-addon-large-showcase-copy {
  min-width: 0;
}

.girls-addon-large-showcase-kicker {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--va-c-primary);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.girls-addon-large-showcase-title {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
}

.girls-addon-large-showcase-description {
  margin: 0.3rem 0 0;
  color: var(--va-c-text-2);
  font-size: 0.72rem;
  line-height: 1.6;
}

.girls-addon-large-showcase-switch {
  display: inline-flex;
  flex: none;
  padding: 0.2rem;
  background: var(--va-c-bg-soft);
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
}

.girls-addon-large-showcase-button {
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

.girls-addon-large-showcase-button-active {
  color: var(--va-c-primary);
  background: var(--va-c-bg-light);
  box-shadow: 0 0.2rem 0.65rem rgb(31 46 64 / 0.09);
}

.girls-addon-large-showcase-button:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 2px;
}

@media (width <= 40rem) {
  .girls-addon-large-showcase-header {
    align-items: stretch;
    flex-direction: column;
  }

  .girls-addon-large-showcase-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
