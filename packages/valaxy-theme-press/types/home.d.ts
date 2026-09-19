export type ThemeableImage
  = | string
    | { src: string, alt?: string, [prop: string]: any }
    | { light: string, dark: string, alt?: string, [prop: string]: any }

export interface HeroAction {
  theme: 'brand' | 'alt'
  text: string
  link: string
  type?: 'fly'
}

export interface Hero {
  name?: string
  text?: string
  tagline?: string
  image?: ThemeableImage
  actions?: HeroAction[]
  /** Hero arrangement. Defaults to split when an image is provided. */
  layout?: 'split' | 'center'
  /** Optional orbital treatment around the configured image. Defaults to image. */
  visual?: 'image' | 'orbit'
  /** Animate the orbital visual. Respects prefers-reduced-motion. Defaults to true. */
  animation?: boolean
  /** Short supporting label above the heading. */
  eyebrow?: string
  /** Caption beneath the hero visual. */
  imageCaption?: string
  /** Optional quick-start command, with a copy button. */
  command?: string
}

export interface Feature {
  icon?: string
  title: string
  details: string
}
