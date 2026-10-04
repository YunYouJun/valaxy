export interface SvgToPngOptions {
  /** Output pixels. Defaults to a 1200 × 630 social preview. */
  width?: number
  height?: number
}

// Freeze SVG presentation and the current CSS animation frame without copying
// page layout (width, height, position) into the standalone image.
const presentationProperties = [
  'color',
  'display',
  'visibility',
  'opacity',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-miterlimit',
  'stop-color',
  'stop-opacity',
  'flood-color',
  'flood-opacity',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'text-anchor',
  'dominant-baseline',
  'paint-order',
  'vector-effect',
  'transform',
  'transform-origin',
  'transform-box',
  'clip-path',
  'mask',
  'filter',
]

/** Export a mounted, self-contained SVG's current frame using the browser canvas. */
export async function svgToPng(svg: SVGSVGElement, options: SvgToPngOptions = {}): Promise<Blob> {
  const { width = 1200, height = 630 } = options
  if (![width, height].every(value => Number.isInteger(value) && value > 0 && value <= 8192))
    throw new Error('SVG export dimensions must be integers between 1 and 8192.')
  if (!svg.isConnected)
    throw new Error('Mount the SVG before exporting so its styles can be resolved.')
  if (svg.querySelector('foreignObject, script, animate, animateMotion, animateTransform, set'))
    throw new Error('SVG export supports SVG graphics and CSS animation, without HTML, scripts or SMIL animation.')
  for (const element of svg.querySelectorAll('[href], [xlink\\:href]')) {
    const href = element.getAttribute('href') || element.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || ''
    if (href && !href.startsWith('#') && !href.startsWith('data:image/'))
      throw new Error('Embed SVG image resources as data URLs before exporting.')
  }

  await svg.ownerDocument.fonts?.ready
  const clone = svg.cloneNode(true) as SVGSVGElement
  const sources = [svg, ...svg.querySelectorAll<SVGElement>('*')]
  const targets = [clone, ...clone.querySelectorAll<SVGElement>('*')]
  sources.forEach((source, index) => {
    const target = targets[index]
    const style = getComputedStyle(source)
    for (const property of presentationProperties) {
      // Browsers may resolve url(#gradient) against the page. Keep local SVG
      // definitions local after moving the snapshot to a blob URL.
      const value = style.getPropertyValue(property).replace(/url\(["']?[^#)"']*#([^#)"']+)["']?\)/g, 'url(#$1)')
      if (value)
        target.style.setProperty(property, value)
    }
    target.style.setProperty('animation', 'none')
    target.style.setProperty('transition', 'none')
  })
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  clone.style.width = `${width}px`
  clone.style.height = `${height}px`

  const source = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(source)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('This browser does not support canvas image export.')
    context.drawImage(image, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode the SVG as PNG.')), 'image/png')
    })
  }
  finally {
    URL.revokeObjectURL(url)
  }
}
