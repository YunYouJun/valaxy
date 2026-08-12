import { version } from '../env'
import { StateManager } from './state'

export class Valaxy {
  /**
   * version
   */
  public static version: string = version

  /**
   * file state
   * @deprecated Pass a build-scoped `StateManager` to plugin factories.
   */
  public static state = new StateManager()

  constructor() {}
}
