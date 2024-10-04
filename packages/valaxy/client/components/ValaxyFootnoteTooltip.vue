<script lang="ts">
import { PopperWrapper } from 'floating-vue'

const Component = ({
  ...PopperWrapper,
  name: 'ValaxyFootnoteTooltip',
  vPopperTheme: 'tooltip',
}) as unknown as typeof PopperWrapper

export default Component
</script>

<style scoped>
div .v-popper {
  display: inline
}
</style>
