<script setup lang="ts">
import { shallowRef } from 'vue'
import { svgToPng } from '../utils/svg'

const props = withDefaults(defineProps<{
  svg?: SVGSVGElement | null
  filename?: string
  label?: string
  width?: number
  height?: number
}>(), { filename: 'cover.png', label: 'Export PNG', width: 1200, height: 630 })

const pending = shallowRef(false)
const error = shallowRef('')

async function download() {
  if (!props.svg || pending.value)
    return
  pending.value = true
  error.value = ''
  try {
    const png = await svgToPng(props.svg, { width: props.width, height: props.height })
    const url = URL.createObjectURL(png)
    const link = document.createElement('a')
    link.href = url
    link.download = props.filename
    document.body.append(link)
    link.click()
    link.remove()
    // Leave the URL alive long enough for the browser to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Could not export this SVG.'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="valaxy-svg-export">
    <button type="button" :disabled="!svg || pending" :aria-busy="pending" @click="download">
      {{ label }}
    </button>
    <p v-if="error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.valaxy-svg-export button {
  padding: 0.5rem 1rem;
  border: 1px solid currentcolor;
  border-radius: 0.5rem;
  font: inherit;
  cursor: pointer;
}

.valaxy-svg-export button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.valaxy-svg-export button:focus-visible {
  outline: 2px solid currentcolor;
  outline-offset: 3px;
}
</style>
