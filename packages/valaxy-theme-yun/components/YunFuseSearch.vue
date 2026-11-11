<script lang="ts">
import { defineAsyncComponent } from 'vue'

// Keep the public component auto-imported so site/addon overrides still win.
export default defineAsyncComponent(() => import('../client/components/YunFuseSearch.vue'))
</script>
