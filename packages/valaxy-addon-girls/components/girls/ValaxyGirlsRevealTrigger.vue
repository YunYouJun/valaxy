<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ValaxyGirlsMoreButton from './ValaxyGirlsMoreButton.vue'

const props = withDefaults(defineProps<{
  auto?: boolean
  count: number
  mode?: 'expand' | 'more'
  remaining: number
}>(), {
  auto: true,
  mode: 'more',
})

const emit = defineEmits<{
  reveal: []
}>()

const { t } = useI18n()
const triggerRef = useTemplateRef<HTMLElement>('trigger')
const supportsObserver = shallowRef(true)
const label = computed(() => t(
  'addon.girls.scroll',
  { count: props.count },
  `Scroll to automatically show ${props.count} more characters`,
))
let observer: IntersectionObserver | undefined
let isPending = false

function stopObserving() {
  observer?.disconnect()
  observer = undefined
}

function reveal() {
  if (isPending)
    return

  isPending = true
  stopObserving()
  emit('reveal')
}

function observe() {
  stopObserving()

  if (!props.auto)
    return

  if (!('IntersectionObserver' in window)) {
    supportsObserver.value = false
    return
  }

  supportsObserver.value = true
  if (!triggerRef.value)
    return

  observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting)
      reveal()
  }, {
    rootMargin: '280px 0px',
    threshold: 0.01,
  })
  observer.observe(triggerRef.value)
}

onMounted(observe)

watch(
  [() => props.auto, () => props.remaining],
  async () => {
    isPending = false
    await nextTick()
    observe()
  },
  { flush: 'post' },
)

onBeforeUnmount(stopObserving)
</script>

<template>
  <div ref="trigger" class="valaxy-girls-reveal-trigger">
    <ValaxyGirlsMoreButton
      v-if="!auto || !supportsObserver"
      :count="count"
      :mode="mode"
      @click="reveal"
    />

    <p v-else class="valaxy-girls-reveal-status" role="status">
      <span class="valaxy-girls-reveal-spinner" aria-hidden="true" />
      <span>{{ label }}</span>
    </p>
  </div>
</template>

<style scoped>
.valaxy-girls-reveal-trigger {
  display: grid;
  min-height: 2.75rem;
  place-items: center;
}

.valaxy-girls-reveal-status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  padding: 0.5rem 0.8rem;
  color: var(--valaxy-girls-muted);
  font-size: 0.68rem;
  line-height: 1.5;
}

.valaxy-girls-reveal-spinner {
  width: 0.85rem;
  height: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--valaxy-girls-sky) 28%, transparent);
  border-top-color: var(--valaxy-girls-sky-deep);
  border-radius: 50%;
  animation: valaxy-girls-reveal-spin 900ms linear infinite;
}

@keyframes valaxy-girls-reveal-spin {
  to {
    transform: rotate(1turn);
  }
}

@media (prefers-reduced-motion: reduce) {
  .valaxy-girls-reveal-spinner {
    animation: none;
  }
}
</style>
