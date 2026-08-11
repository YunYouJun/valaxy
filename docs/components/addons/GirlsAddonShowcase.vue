<script setup lang="ts">
import type { GirlEntry, GirlReasonMode, GirlsLayout } from 'valaxy-addon-girls'
import ValaxyGirls from 'valaxy-addon-girls/components/ValaxyGirls.vue'
import { computed, shallowRef } from 'vue'

const props = withDefaults(defineProps<{
  locale?: 'en' | 'zh-CN'
}>(), {
  locale: 'en',
})

const layout = shallowRef<GirlsLayout>('bubbles')
const reasonMode = shallowRef<GirlReasonMode>('hidden')
const isZh = computed(() => props.locale === 'zh-CN')
const title = computed(() => isZh.value ? '角色画廊交互预览' : 'Interactive character gallery')
const description = computed(() => isZh.value
  ? `当前布局：${layout.value} · 可切换备注显示方式`
  : `Current layout: ${layout.value} · Try another reason mode`)
const reasonLabel = computed(() => isZh.value ? '备注显示' : 'Reason display')
const reasonOptions = computed(() => [
  { label: isZh.value ? '隐藏' : 'Hidden', value: 'hidden' },
  { label: isZh.value ? '始终显示' : 'Inline', value: 'inline' },
  { label: isZh.value ? '悬浮显示' : 'Hover', value: 'hover' },
] satisfies { label: string, value: GirlReasonMode }[])

const sampleGirls: GirlEntry[] = [
  {
    name: 'C.C.',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/b1111-hNdvOW5ZNCCH.png',
    from: 'CODE GEASS',
    reason: 'Calm, mysterious, and quietly gentle.',
  },
  {
    name: '黑雪姬',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/b46305-CiZOEqz5u1mk.png',
    from: '加速世界',
    reason: 'Elegant resolve behind a composed presence.',
  },
  {
    name: '仓岛千百合',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/b49635-lDQ1nWr4gBRX.png',
    from: '加速世界',
    reason: 'Bright, sincere, and full of energy.',
  },
  {
    name: '筒隐月子',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/n42469-shq7IzxyJNbJ.jpg',
    from: '变态王子与不笑猫',
    reason: 'A deadpan expression with a tender heart.',
  },
  {
    name: '松前绪花',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36184-ylcMtZPMm1cB.png',
    from: '花开伊吕波',
    reason: 'Optimistic, resilient, and always moving forward.',
  },
  {
    name: '阿库娅',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/b89362-ibkc0eoECaW1.png',
    from: '为美好的世界献上祝福！',
    reason: 'Chaotic joy in its most memorable form.',
  },
  {
    name: '北白川玉子',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/b74850-D8ksLbb9p9cw.png',
    from: '玉子市场',
    reason: 'Warmth that makes an ordinary day feel special.',
  },
  {
    name: '赫萝',
    avatar: 'https://s4.anilist.co/file/anilistcdn/character/medium/b7373-1BH0gELuZmHD.jpg',
    from: '狼与香辛料',
    reason: 'Wise, playful, and wonderfully self-assured.',
  },
]
</script>

<template>
  <section class="girls-addon-showcase">
    <div class="girls-addon-showcase-toolbar">
      <span class="girls-addon-showcase-label">{{ reasonLabel }}</span>
      <div class="girls-addon-showcase-options" role="group" :aria-label="reasonLabel">
        <button
          v-for="option in reasonOptions"
          :key="option.value"
          class="girls-addon-showcase-button"
          :class="{ 'girls-addon-showcase-button-active': reasonMode === option.value }"
          type="button"
          :aria-pressed="reasonMode === option.value"
          @click="reasonMode = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <ValaxyGirls
      v-model:layout="layout"
      :girls="sampleGirls"
      :reason-mode="reasonMode"
      render-mode="all"
      switchable
    >
      <template #header="{ count }">
        <div class="girls-addon-showcase-header">
          <div>
            <h3 class="girls-addon-showcase-title">
              {{ title }}
            </h3>
            <p class="girls-addon-showcase-description" aria-live="polite">
              {{ description }}
            </p>
          </div>
          <span class="girls-addon-showcase-count">{{ count }}</span>
        </div>
      </template>
    </ValaxyGirls>
  </section>
</template>

<style scoped>
.girls-addon-showcase {
  margin: 1rem 0 1.75rem;
  padding: clamp(0.75rem, 2vw, 1rem);
  background: color-mix(in srgb, var(--va-c-bg-soft) 70%, transparent);
  border: 1px solid var(--va-c-divider);
  border-radius: 0.9rem;
}

.girls-addon-showcase-toolbar,
.girls-addon-showcase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.girls-addon-showcase-toolbar {
  margin-bottom: 1rem;
}

.girls-addon-showcase-label,
.girls-addon-showcase-description {
  color: var(--va-c-text-2);
  font-size: 0.75rem;
}

.girls-addon-showcase-options {
  display: inline-flex;
  padding: 0.2rem;
  background: var(--va-c-bg-light);
  border: 1px solid var(--va-c-divider);
  border-radius: 999px;
}

.girls-addon-showcase-button {
  min-height: 2.25rem;
  padding: 0.4rem 0.7rem;
  color: var(--va-c-text-2);
  background: transparent;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.girls-addon-showcase-button-active {
  color: var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 10%, var(--va-c-bg-light));
}

.girls-addon-showcase-button:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 2px;
}

.girls-addon-showcase-header {
  align-items: flex-end;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--va-c-divider);
}

.girls-addon-showcase-title {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
}

.girls-addon-showcase-description {
  margin: 0.25rem 0 0;
}

.girls-addon-showcase-count {
  display: grid;
  flex: none;
  width: 2rem;
  height: 2rem;
  color: var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 10%, transparent);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  place-items: center;
}

@media (width <= 36rem) {
  .girls-addon-showcase-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .girls-addon-showcase-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
