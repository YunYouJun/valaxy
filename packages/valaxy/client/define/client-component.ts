import type { Component } from 'vue'
import { defineAsyncComponent, defineComponent, h, onMounted, ref } from 'vue'

/**
 * Define a component that only renders on the client side.
 *
 * Useful for wrapping browser-only third-party libraries that access
 * `window`, `document`, or other browser APIs not available during SSR/SSG.
 *
 * @param loader - Dynamic import function, e.g. `() => import('some-lib')`
 * @param args - Optional tuple of `[props, children]` to pass to the component
 * @param cb - Optional callback invoked with the resolved component module
 */
export function defineClientComponent(
  loader: () => Promise<Component | { default: Component }>,
  args?: [Record<string, any>?, (Record<string, any> | (() => any))?],
  cb?: (component: any) => void,
) {
  const [props, children] = args ?? []

  const AsyncComp = defineAsyncComponent(async () => {
    const comp = await loader()
    if (cb)
      cb(comp)
    return comp
  })

  return defineComponent({
    name: 'ValaxyClientComponent',
    setup(_, { slots }) {
      const show = ref(false)
      onMounted(() => {
        show.value = true
      })

      return () => {
        if (!show.value)
          return slots.fallback?.() ?? null

        const childContent = typeof children === 'function' ? children() : children
        return h(AsyncComp, props, childContent)
      }
    },
  })
}
