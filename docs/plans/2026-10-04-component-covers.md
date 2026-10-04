# Vue component covers

`coverComponent` selects a component by filename from `components/covers/`; `coverProps` carries serializable values. A component cover can render entirely with SVG and does not require `cover`. The optional `cover` field remains an image URL for fallback rendering. `ogImage` independently selects a social image; Valaxy does not automatically screenshot a component. Markdown reuses the existing Vue component support.

The core owns discovery and fallback rendering. Yun connects that renderer to article headers and post cards. Components use Vue async loading and participate in SSR. Only the dedicated cover directory is discovered. User roots override theme and addon roots. Adding or removing a cover refreshes the development registry.

## Hello Valaxy example

The demo and blog scaffold draw every visual with inline SVG: a navy-to-sky background, layered cloud paths, orbital geometry, and a V-shaped constellation. No generated raster assets or image requests are used. The single component owns drawing and interaction; the generic cover renderer owns placement. Documentation renders the actual scaffold component and includes its complete source.

- Palette: midnight `#102751`, sky `#225d93`, cloud `#b4e4e9`, starlight `#c4f6ff`.
- Typography: SVG-native serif display text and sans-serif subtitle, aligned at the lower left. The constellation occupies the upper right, remaining visible in a compact card.
- Interaction: a keyboard-accessible toggle draws the constellation and starts the orbit/cloud motion; toggling off pauses it.
- Performance: animation pauses outside the viewport or when the tab is hidden. Observers and listeners are cleaned up on unmount.
- Accessibility: reduced-motion disables movement/transitions while preserving the toggle. Decorative SVG is hidden from assistive technology.
- Rendering: fixed coordinates and Vue `useId()` keep SSR deterministic and SVG definitions unique across instances. Each instance owns its toggle state.

Vue and CSS are sufficient for this example. Animation libraries remain optional component dependencies, rather than a requirement of the cover API.

## Diagnostics and social export

Development-only cover diagnostics identify missing components and preserve original errors while retaining image fallbacks. Production UI stays unchanged. `svgToPng` freezes a mounted self-contained SVG with its computed presentation styles into a browser-generated PNG; `ValaxySvgExport` owns download/error state. The example exposes its SVG element, and the docs wrapper supplies the export control. Text is part of the same SVG so it appears in the 1200 × 630 social image. Export does not run during SSR or add build dependencies; authors save the PNG under public/images and set ogImage.
