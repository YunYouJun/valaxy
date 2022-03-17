import { initConfig, valaxyConfigSymbol } from '../../../core/config'
import type { UserModule } from '~/types'

// https://github.com/antfu/vite-plugin-pwa#automatic-reload-when-new-content-available
export const install: UserModule = ({ app }) => {
  const valaxyConfigRef = initConfig()
  app.provide(valaxyConfigSymbol, valaxyConfigRef)
}
