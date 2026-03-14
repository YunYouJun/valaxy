import mediumZoom from 'medium-zoom'
import { useSiteConfig } from 'valaxy'
import { onMounted } from 'vue'

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

      // Fix blurry images after zoom animation completes.
      // medium-zoom uses CSS transform: scale() which causes browsers (especially
      // Chrome) to render scaled images at lower quality.
      // After the open animation, we replace the transform with actual dimensions
      // to force full-resolution rendering. Before closing, we restore the original
      // transform so the close animation works correctly.
      // @see https://github.com/francoischalifour/medium-zoom/issues/151
      let savedTransform = ''

      zoom.on('opened', () => {
        const zoomed = document.querySelector('.medium-zoom-image--opened') as HTMLElement | null
        if (!zoomed)
          return

        const { transform } = zoomed.style
        const scaleMatch = transform.match(/scale\(([^)]+)\)/)
        if (!scaleMatch)
          return

        const scale = Number.parseFloat(scaleMatch[1])
        if (!scale || scale === 1)
          return

        savedTransform = transform
        const rect = zoomed.getBoundingClientRect()

        // Replace scale transform with actual width/height
        zoomed.style.transform = transform.replace(/scale\([^)]+\)/, 'scale(1)')
        zoomed.style.width = `${rect.width}px`
        zoomed.style.height = `${rect.height}px`
      })

      zoom.on('close', () => {
        if (!savedTransform)
          return

        const zoomed = document.querySelector('.medium-zoom-image--opened') as HTMLElement | null
        if (zoomed) {
          // Restore original transform for close animation
          zoomed.style.transform = savedTransform
          zoomed.style.width = ''
          zoomed.style.height = ''
        }
        savedTransform = ''
      })
    })
  }
}
