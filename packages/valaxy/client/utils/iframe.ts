const RESPONSIVE_IFRAME_ATTRIBUTE = 'data-va-responsive-iframe'
const IFRAME_ASPECT_RATIO_PROPERTY = '--va-iframe-aspect-ratio'

function parsePositiveDimension(value: string | null) {
  if (value === null)
    return

  const dimension = Number(value)
  if (Number.isFinite(dimension) && dimension > 0)
    return dimension
}

/**
 * Make dimensioned iframes responsive without assuming a fixed video ratio.
 * The generated custom property is consumed by the low-specificity markdown
 * styles, so an author's explicit height or aspect-ratio still takes priority.
 */
export function setIframeAspectRatios(container: ParentNode = document) {
  container.querySelectorAll<HTMLIFrameElement>('iframe').forEach((iframe) => {
    const width = parsePositiveDimension(iframe.getAttribute('width'))
    const height = parsePositiveDimension(iframe.getAttribute('height'))

    if (width && height) {
      iframe.setAttribute(RESPONSIVE_IFRAME_ATTRIBUTE, '')
      iframe.style.setProperty(IFRAME_ASPECT_RATIO_PROPERTY, `${width} / ${height}`)
      return
    }

    if (iframe.hasAttribute(RESPONSIVE_IFRAME_ATTRIBUTE)) {
      iframe.removeAttribute(RESPONSIVE_IFRAME_ATTRIBUTE)
      iframe.style.removeProperty(IFRAME_ASPECT_RATIO_PROPERTY)
    }
  })
}
