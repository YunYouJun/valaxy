import { version } from '../env'
import { StateManager } from './state'

export class Valaxy {
  /**
   * version
   */
  public static version: string = version

  /**
   * file state
   */
  public static state = new StateManager()

  constructor() {}
}
