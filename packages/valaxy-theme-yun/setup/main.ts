import { defineAppSetup } from 'valaxy'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

export default defineAppSetup((_ctx) => {
  // can do for setup

  // for types in time warning
  dayjs.extend(timezone)
})
