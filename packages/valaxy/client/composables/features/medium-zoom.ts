import mediumZoom from 'medium-zoom'
import { useSiteConfig } from 'valaxy'
import { onMounted } from 'vue'

/**
 * @description image preview by medium-zoom
 */
export const useMediumZoom = () => {
  const siteConfig = useSiteConfig()
  const mediumZoomConfig = siteConfig.value.mediumZoom

  onMounted(() => {
    if (mediumZoomConfig.enable) {
      mediumZoom(
        mediumZoomConfig.selector || '.markdown-body img',
        {
          background: 'var(--medium-zoom-c-bg, rgba(0, 0, 0, 0.8))',
          ...mediumZoomConfig.options,
        },
      )
    }
  })
}
