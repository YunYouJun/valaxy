# valaxy-addon-icons

Used to add directory icons under [unocss#preset-icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons#nodejs)

```ts
import { defineConfig } from 'valaxy'
export default defineConfig({
  addons: [
    'valaxy-addon-icons'
  ]
})
```

## options

```ts
export interface IconAddonOptions {
  /**
   * The current directory to resolve
   */
  dir?: string
  /**
   * @template `i-<collection>-<icon>`
   * @template `i-<collection>:<icon>`
   * @default custom `i-custom-<icon>`
   */
  collection?: string
  /**
   * convert currentColor, clean icon
   */
  optimize?: boolean
  /**
   * @see http://github.com/unocss/unocss/tree/main/packages/preset-icons#icon-customizations
   */
  customizations?: IconsOptions['customizations']
}
```