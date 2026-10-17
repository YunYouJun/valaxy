<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ to: string, label: string }>()

// `/release/` always points at the latest release page. Static hosts follow the
// meta refresh from the prerendered HTML; in-app navigation replaces the route.
useHead({
  meta: [{ 'http-equiv': 'refresh', 'content': `0; url=${props.to}` }],
  link: [{ rel: 'canonical', href: `https://valaxy.site${props.to}` }],
})

const router = useRouter()
onMounted(() => router.replace(props.to))
</script>

<template>
  <p class="release-latest">
    <RouterLink :to="to">
      {{ label }}
    </RouterLink>
  </p>
</template>

<style scoped>
.release-latest {
  padding: 120px 24px;
  text-align: center;
}
</style>
