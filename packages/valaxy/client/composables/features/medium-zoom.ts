import mediumZoom from 'medium-zoom'
import { useSiteConfig } from 'valaxy'
import { onMounted } from 'vue'

interface ZoomRectLike {
  left: number
  top: number
  width: number
  height: number
}

interface ZoomImageStyle {
  transform: string
  width: string
  height: string
}

interface SavedZoomImageStyle extends ZoomImageStyle {
  element: HTMLElement
}

/**
 * Convert the opened transform into real dimensions while keeping the same viewport rect.
 * This avoids Chrome rendering the zoomed image blurry because of transform scaling.
 *
 * @see https://github.com/francoischalifour/medium-zoom/issues/151
 * @see https://github.com/YunYouJun/valaxy/issues/317
 * @see https://github.com/YunYouJun/valaxy/issues/692
 */
export function computeZoomRectStyle(
  visualRect: ZoomRectLike,
  layoutOffset: Pick<ZoomRectLike, 'left' | 'top'>,
  scrollOffset = { x: 0, y: 0 },
): ZoomImageStyle {
  return {
    transform: `translate3d(${visualRect.left + scrollOffset.x - layoutOffset.left}px, ${visualRect.top + scrollOffset.y - layoutOffset.top}px, 0)`,
    width: `${visualRect.width}px`,
    height: `${visualRect.height}px`,
  }
}

function getDocumentScroll() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
    y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
  }
}

function getStylePixelValue(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function applyWithoutTransformTransition(element: HTMLElement, apply: () => void) {
  const transition = element.style.transition
  const transitionPriority = element.style.getPropertyPriority('transition')

  element.style.setProperty('transition', 'none', 'important')
  apply()
  void element.offsetWidth

  if (transition)
    element.style.setProperty('transition', transition, transitionPriority)
  else
    element.style.removeProperty('transition')
}

function freezeOpenedImage(element: HTMLElement): SavedZoomImageStyle | null {
  const scaleMatch = element.style.transform.match(/scale\(([^)]+)\)/)
  const scale = scaleMatch ? Number.parseFloat(scaleMatch[1]) : 1
  if (!scale || scale === 1)
    return null

  const rect = element.getBoundingClientRect()
  const scrollOffset = getDocumentScroll()
  const layoutOffset = {
    left: getStylePixelValue(element.style.left, rect.left + scrollOffset.x),
    top: getStylePixelValue(element.style.top, rect.top + scrollOffset.y),
  }
  const nextStyle = computeZoomRectStyle(rect, layoutOffset, scrollOffset)
  const savedStyle: SavedZoomImageStyle = {
    element,
    transform: element.style.transform,
    width: element.style.width,
    height: element.style.height,
  }

  applyWithoutTransformTransition(element, () => {
    element.style.transform = nextStyle.transform
    element.style.width = nextStyle.width
    element.style.height = nextStyle.height
  })

  return savedStyle
}

/**
 * @description image preview by medium-zoom
 */
export function useMediumZoom() {
  const siteConfig = useSiteConfig()
  const mediumZoomConfig = siteConfig.value.mediumZoom

  if (mediumZoomConfig.enable) {
    onMounted(() => {
      const zoom = mediumZoom(
        mediumZoomConfig.selector || '.markdown-body img',
        {
          background: 'var(--medium-zoom-c-bg, rgba(0, 0, 0, 0.8))',
          ...mediumZoomConfig.options,
        },
      )

      let savedStyles: SavedZoomImageStyle[] = []

      zoom.on('opened', () => {
        savedStyles = Array
          .from(document.querySelectorAll<HTMLElement>('.medium-zoom-image--opened'))
          .map(freezeOpenedImage)
          .filter((style): style is SavedZoomImageStyle => style !== null)
      })

      zoom.on('close', () => {
        if (!savedStyles.length)
          return

        for (const style of savedStyles) {
          const { element } = style
          if (!document.body.contains(element))
            continue

          // Restore original medium-zoom styles so the close animation works correctly.
          // medium-zoom will clear transform to '' itself after the transition ends.
          applyWithoutTransformTransition(element, () => {
            element.style.transform = style.transform
            element.style.width = style.width
            element.style.height = style.height
          })
        }

        savedStyles = []
      })
    })
  }
}
