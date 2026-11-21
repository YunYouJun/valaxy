/**
 * Copy text to the system clipboard using the async Clipboard API with a
 * DOM `execCommand('copy')` fallback for restricted contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    }
    catch {
      // Fall through to execCommand fallback
    }
  }

  if (typeof document === 'undefined' || !document.body)
    return false

  const element = document.createElement('textarea')
  const previouslyFocusedElement = document.activeElement

  element.value = text

  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '')

  element.style.contain = 'strict'
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.fontSize = '12pt' // Prevent zooming on iOS

  const selection = document.getSelection()
  const originalRange = selection && selection.rangeCount > 0
    ? selection.getRangeAt(0)
    : null

  document.body.appendChild(element)
  element.select()

  // Explicit selection workaround for iOS
  element.selectionStart = 0
  element.selectionEnd = text.length

  let copied = false
  try {
    copied = document.execCommand('copy')
  }
  catch {
    copied = false
  }
  finally {
    document.body.removeChild(element)
  }

  if (originalRange && selection) {
    selection.removeAllRanges()
    selection.addRange(originalRange)
  }

  // Get the focus back on the previously focused element, if any
  if (previouslyFocusedElement instanceof HTMLElement)
    previouslyFocusedElement.focus({ preventScroll: true })

  return copied
}
