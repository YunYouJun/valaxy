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
@import 'floating-vue/dist/style.css';

div .v-popper {
  display: inline
}
</style>
