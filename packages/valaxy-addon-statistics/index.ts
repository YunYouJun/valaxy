import fs from 'fs'
import { defineAddon } from 'valaxy'
import readingTime from 'reading-time'

const ValaxyAddonStatistics = defineAddon({
  extendMd(ctx) {
    const file = fs.readFileSync(ctx.path, 'utf-8')
    const stats = readingTime(file)
    ctx.route.meta.frontmatter.stats = {
      minutes: stats.minutes,
      time: stats.time,
      words: stats.words,
      length: file.length,
    }
  },
})

export default ValaxyAddonStatistics
