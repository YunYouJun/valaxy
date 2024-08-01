export function getAppWindow() {
  return window.parent.parent as unknown as {
    __VUE_INSPECTOR__: {
      openInEditor: (baseUrl: string, file: string, line: number, column: number) => void
    }
  }
}

/**
 * window.parent.parent is the window object of the main app
 */
export function getWindowProperty(property: string) {
  if (import.meta.env.DEV)
    return (window as any)[property]

  return (window.parent.parent as any)[property]
}

export function getGlobalValaxyProperty(property: string) {
  if (import.meta.env.DEV)
    return (window as any).$valaxy[property]

  const $valaxy = (window.parent.parent as any).$valaxy
  return $valaxy[property]
}
