<script>
import { defineBasicLoader } from 'unplugin-vue-router/data-loaders/basic'

export const usePageData = defineBasicLoader('/relativePath', async (_to) => {
  // custom basic loader
}, {
  // @see https://uvr.esm.is/data-loaders/defining-loaders.html#non-blocking-loaders-with-lazy
  lazy: (to, from) => to.name === from.name,
})
</script>
