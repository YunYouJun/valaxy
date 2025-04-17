import { version } from '../../package.json'
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
