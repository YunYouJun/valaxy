<script setup lang="ts">
import { useEventListener, useResizeObserver, useStorage } from '@vueuse/core'
import { onContentUpdated, useScreenSize } from 'valaxy'
import { computed, onMounted, onUnmounted, shallowRef, useTemplateRef, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const props = defineProps<{ layout?: HTMLElement | null }>()

interface AuthorNote {
  id: string
  definition: HTMLElement
  links: HTMLAnchorElement[]
  label: string
}

const { t } = useI18n()
const route = useRoute()
const { isXl } = useScreenSize()
const expanded = useStorage('yun-author-notes-open', true, undefined, { initOnMounted: true })
const notes = shallowRef<AuthorNote[]>([])
const article = shallowRef<HTMLElement>()
const toolbar = shallowRef<HTMLElement>()
const selected = shallowRef<string>()
const track = useTemplateRef('track')
const cards = useTemplateRef<HTMLElement[]>('cards')
const visible = computed(() => isXl.value && expanded.value && notes.value.length > 0 && Boolean(toolbar.value))
const label = computed(() => t(expanded.value ? 'theme.hideAuthorNotes' : 'theme.showAuthorNotes'))

const renderedBodies = new WeakMap<HTMLElement, string>()
let frame = 0

function readNotes() {
  const main = props.layout?.querySelector<HTMLElement>(':scope > .yun-main')
  const nextArticle = main?.querySelector<HTMLElement>('article') ?? undefined
  if (article.value !== nextArticle)
    selected.value = undefined
  article.value = nextArticle
  toolbar.value = main?.querySelector<HTMLElement>('[data-yun-author-note-actions]') ?? undefined
  if (!nextArticle) {
    notes.value = []
    return
  }

  const definitions = new Map(Array.from(nextArticle.querySelectorAll<HTMLElement>('.footnote-item[id]'), element => [element.id, element]))
  const byId = new Map<string, AuthorNote>()
  for (const link of nextArticle.querySelectorAll<HTMLAnchorElement>('.va-footnote[data-footnote-kind="author"] .footnote-ref a[href^="#"]')) {
    if (link.closest('.footnotes'))
      continue
    const id = link.getAttribute('href')!.slice(1)
    const definition = definitions.get(id)
    if (!definition)
      continue
    const note = byId.get(id)
    if (note)
      note.links.push(link)
    else
      byId.set(id, { id, definition, links: [link], label: link.textContent?.trim() || id })
  }
  notes.value = [...byId.values()]
  if (selected.value && !byId.has(selected.value))
    selected.value = undefined
}

function renderBody(element: unknown, definition: HTMLElement) {
  if (!(element instanceof HTMLElement) || renderedBodies.get(element) === definition.innerHTML)
    return

  // Use the existing rendered Markdown. Keep target IDs and backreferences in
  // the original footnote definition so direct links remain usable.
  const copy = definition.cloneNode(true) as HTMLElement
  for (const child of copy.querySelectorAll('.footnote-backref, script, .va-footnote-preview'))
    child.remove()
  for (const node of copy.querySelectorAll('[id]'))
    node.removeAttribute('id')
  element.replaceChildren(...copy.childNodes)
  renderedBodies.set(element, definition.innerHTML)
}

function place() {
  if (!visible.value)
    return
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const list = track.value
    if (!list || !cards.value?.length)
      return
    const origin = list.getBoundingClientRect().top
    const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0
    let bottom = -gap
    const byId = new Map(cards.value.map(card => [card.dataset.noteId, card]))
    for (const note of notes.value) {
      const card = byId.get(note.id)
      if (!card)
        continue
      const anchor = note.links.find(link => link.getClientRects().length)
      const top = Math.max(0, anchor ? anchor.getBoundingClientRect().top - origin : 0, bottom + gap)
      card.style.top = `${top}px`
      bottom = top + card.offsetHeight
    }
    list.style.height = `${Math.max(0, bottom)}px`
  })
}

function focusNote(id: string, element?: HTMLElement) {
  selected.value = id
  if (!element)
    return
  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'nearest' })
}

function navigate(event: MouseEvent, id: string, element?: HTMLElement) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return
  event.preventDefault()
  focusNote(id, element)
}

watchEffect((onCleanup) => {
  if (!visible.value)
    return
  const links = notes.value.flatMap(note => note.links)
  for (const link of links)
    link.setAttribute('data-valaxy-native-link', '')
  onCleanup(() => {
    for (const link of links)
      link.removeAttribute('data-valaxy-native-link')
  })
}, { flush: 'post' })

useEventListener(() => props.layout, 'click', (event) => {
  if (!visible.value || !(event.target instanceof Element))
    return
  const link = event.target.closest('a[data-valaxy-native-link]')
  const note = link && notes.value.find(note => note.links.includes(link as HTMLAnchorElement))
  if (note)
    navigate(event, note.id, cards.value?.find(card => card.dataset.noteId === note.id))
}, { capture: true })

useEventListener(() => props.layout, 'pointerenter', (event) => {
  if (visible.value && event.target instanceof Element
    && event.target.closest('.va-footnote[data-footnote-kind="author"]:has(a[data-valaxy-native-link])')) {
    // The margin note already provides the preview at this width.
    event.stopPropagation()
  }
}, { capture: true })

onContentUpdated(readNotes)
onMounted(readNotes)
watch([() => props.layout, () => route.path], readNotes, { flush: 'post' })
watch([visible, notes], place, { flush: 'post' })
useResizeObserver(() => [article.value, ...(cards.value ?? [])], place)
useEventListener('resize', place)
useEventListener(article, 'load', place, { capture: true })
useEventListener(article, 'toggle', place, { capture: true })
onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
  <Teleport v-if="toolbar && isXl && notes.length" :to="toolbar">
    <button
      class="yun-action-btn yun-author-notes-toggle"
      type="button"
      :aria-pressed="expanded"
      :aria-controls="visible ? 'yun-author-notes' : undefined"
      :aria-label="label"
      :title="label"
      @click="expanded = !expanded"
    >
      <span i-ri-side-bar-line aria-hidden="true" />
    </button>
  </Teleport>

  <aside v-if="visible" id="yun-author-notes" class="yun-author-notes" :aria-label="t('theme.authorNotes')">
    <h2 class="yun-author-notes-heading">
      {{ t('theme.authorNotes') }}
    </h2>
    <div ref="track" class="yun-author-note-track">
      <section
        v-for="note in notes" :key="note.id" ref="cards"
        class="yun-author-note-card"
        :data-note-id="note.id"
        :data-current="selected === note.id ? '' : undefined"
        tabindex="-1"
        :aria-label="t('theme.authorNoteLabel', { label: note.label })"
      >
        <a
          class="yun-author-note-index"
          :href="`#${note.links[0]!.id}`"
          :aria-label="t('theme.backToAuthorNote', { label: note.label })"
          data-valaxy-native-link
          @click="navigate($event, note.id, note.links.find(link => link.getClientRects().length))"
        >{{ note.label }}</a>
        <div :ref="element => renderBody(element, note.definition)" class="markdown-body yun-author-note-content" />
      </section>
    </div>
  </aside>
</template>

<style lang="scss">
.yun-author-notes {
  flex: 0 0 clamp(16.5rem, 19.5vw, 19rem);
  min-width: 0;
  text-align: start;
}

.yun-author-notes-heading {
  display: flex;
  align-items: center;
  min-height: var(--yun-action-btn-size);
  margin-block: 0.25rem 0.5rem;
  padding-block-end: 0.5rem;
  border-bottom: 1px solid var(--yun-surface-line);
  color: var(--va-c-text-2);
  font-size: 0.9rem;
  font-weight: 650;
}

.yun-author-note-track {
  position: relative;
  display: grid;
  row-gap: 0.75rem;
}

.yun-author-note-card {
  position: absolute;
  inset-inline: 0;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.4rem 0.55rem;
  align-items: start;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: var(--yun-action-btn-radius);
  background: var(--yun-bg-elevated);
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.65;
  scroll-margin-block-start: var(--yun-margin-top);
  overflow-wrap: anywhere;

  // Valaxy wraps highlighted fences and hydrated tables.
  &:has(> .yun-author-note-content > :first-child:is(pre, table, .table-container, .vp-code-group, div[class*='language-'])) {
    grid-template-columns: minmax(0, 1fr);
  }

  &:is(:hover, [data-current]) {
    border-color: color-mix(in srgb, var(--va-c-link) 38%, var(--yun-surface-line));
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }
}

.yun-author-note-index {
  display: inline-flex;
  justify-self: start;
  padding: 0 0.25em;
  border-radius: 0.25em;
  background: var(--yun-action-btn-hover-bg);
  color: var(--va-c-link);
  font-variant-numeric: tabular-nums;
}

.yun-author-note-content.markdown-body {
  min-width: 0;
  font-size: inherit;
  line-height: inherit;

  > :first-child {
    margin-block-start: 0;
  }

  > :last-child {
    margin-block-end: 0;
  }
}

.yun-author-notes-toggle.yun-action-btn[aria-pressed='true'] {
  background: var(--yun-action-btn-hover-bg);
  color: var(--va-c-link);
}

.va-footnote[data-footnote-kind='author']:has(a[data-valaxy-native-link]) > .va-footnote-preview {
  display: none;
}
</style>
