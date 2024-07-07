import type { UseDarkOptions } from '@vueuse/core'

// eslint-disable-next-line ts/no-namespace
export namespace DefaultTheme {
  export interface Config {
    valaxyDarkOptions?: {
      /**
       * Options for `useDark`
       * disableTransition default is `true`
       * Its options are not computed, init when loaded.
       * @see https://vueuse.org/core/useDark
       * @url https://paco.me/writing/disable-theme-transitions
       *
       * @zh `useDark` 的选项
       * disableTransition 默认为 `true`，不会进行渐变过渡，这是 VueUse 的默认行为
       */
      useDarkOptions?: UseDarkOptions
      /**
       * Enable circle transition when toggling dark mode
       * Then use `toggleDarkWithTransition` instead of `toggleDark`
       * @zh 启用圆形过渡切换暗黑模式
       */
      circleTransition?: boolean

      /**
       * Theme color
       * @zh 主题色
       */
      themeColor?: {
        /**
         * Theme color for light mode
         * @zh 亮色主题色
         */
        light?: string
        /**
         * Theme color for dark mode
         * @zh 暗色主题色
         */
        dark?: string
      }
    }
    /**
     * Custom header levels of outline in the aside component.
     *
     * @default 2
     */
    outline?: number | [number, number] | 'deep' | false
  }
}
