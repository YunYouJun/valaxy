import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'ClientOnly',
  setup(_, { slots }) {
    const show = ref(false)
    onMounted(() => {
      show.value = true
    })
    return () => show.value ? slots.default?.() : slots.fallback?.() ?? null
  },
})
