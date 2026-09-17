import { onValaxyPageChanged } from '../../client-api'
import { activePath } from '../composables/app'
import { inspectedPage } from '../stores/app'

export function initDevtoolsClient() {
  return onValaxyPageChanged((page) => {
    activePath.value = page?.routePath || ''
    inspectedPage.value = page
  })
}
