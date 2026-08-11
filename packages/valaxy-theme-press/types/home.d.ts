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
}

export interface Feature {
  icon?: string
  title: string
  details: string
}
