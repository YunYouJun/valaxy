declare module 'valaxy/default-theme' {
  export interface Config {
    /**
     * Custom header levels of outline in the aside component.
     *
     * @default 2
     */
    outline?: number | [number, number] | 'deep' | false
  }
}
