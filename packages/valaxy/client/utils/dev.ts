export function initDevToolsClientLogic() {

}

export function setWindowValaxyProp(property: string, value: any) {
  if (!(window as any).$valaxy) {
    ;(window as any).$valaxy = {}
  }
  const $valaxy = ((window as any).$valaxy) as {
    [key: string]: any
  }
  $valaxy[property] = value
}
