<script setup lang="ts">
import type { PostcardCopy } from './postcard'
import { nextTick, shallowRef, useTemplateRef } from 'vue'
import { catalogNumber, drawPostcard } from './postcard'

const props = defineProps<{
  copy: PostcardCopy & { download: string, share: string, close: string, alt: string }
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const text = shallowRef('')
const canShare = shallowRef(false)

function fileName() {
  return `valaxy-postcard-${catalogNumber(text.value)}.png`
}

function toBlob() {
  return new Promise<Blob | null>(resolve => canvas.value?.toBlob(resolve, 'image/png'))
}

async function open(line: string) {
  text.value = line
  dialog.value?.showModal()
  await nextTick()
  if (canvas.value)
    drawPostcard(canvas.value, line, props.copy)
  const probe = new File([], fileName(), { type: 'image/png' })
  canShare.value = typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] })
}

async function download() {
  const blob = await toBlob()
  if (!blob)
    return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName()
  link.click()
  URL.revokeObjectURL(url)
}

async function share() {
  const blob = await toBlob()
  if (!blob)
    return
  try {
    await navigator.share({ files: [new File([blob], fileName(), { type: 'image/png' })], title: props.copy.title })
  }
  catch {
    // Dismissing the share sheet is not an error worth surfacing.
  }
}

defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="postcard-dialog" :aria-label="copy.title" @click.self="dialog?.close()">
    <div class="postcard-sheet">
      <canvas ref="canvas" class="postcard-canvas" role="img" :aria-label="`${copy.alt}${text}`" />
      <div class="postcard-actions">
        <button type="button" class="is-primary" @click="download">
          {{ copy.download }}
        </button>
        <button v-if="canShare" type="button" @click="share">
          {{ copy.share }}
        </button>
        <button type="button" class="postcard-close" @click="dialog?.close()">
          {{ copy.close }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.postcard-dialog {
  /* Page resets zero the UA margins that normally center a modal dialog. */
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(960px, 100% - 32px);
  max-width: none;
  height: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
}

.postcard-dialog::backdrop {
  background: rgb(4 12 40 / 0.78);
}

.postcard-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  border-radius: 4px;
  background: #0a1a4f;
}

.postcard-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.postcard-actions button {
  height: 44px;
  padding: 0 18px;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 4px;
  color: #fff;
  background: transparent;
  font: inherit;
  font-size: 15px;
}

.postcard-actions .is-primary {
  border-color: #eef3ff;
  color: #0a1a4f;
  background: #eef3ff;
  font-weight: 600;
}

.postcard-actions .postcard-close {
  margin-left: auto;
}

.postcard-actions button:focus-visible {
  outline: 2px solid #c9a7ff;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .postcard-dialog[open] .postcard-sheet {
    animation: postcard-arrive 420ms cubic-bezier(0.22, 1, 0.36, 1);
  }
}

@keyframes postcard-arrive {
  from {
    opacity: 0;
    transform: translateY(24px) rotate(-1.5deg);
  }
}
</style>
