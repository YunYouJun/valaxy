<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { ref, onMounted } from 'vue'

const fm = useFrontmatter()
const { t } = useI18n()

const content = ref('')
let timer: NodeJS.Timeout
const typing = (interval = 80) => {
  let i = 0
  timer = setInterval(() => {
    content.value += fm.value?.excerpt?.charAt(i)
    i++
    if (i === fm.value?.excerpt?.length) {
      clearInterval(timer)
    }
  }, interval)
  return timer
}

const clear = () => {
  clearInterval(timer)
  content.value = fm.value?.excerpt ?? ''
}

onMounted(() => {
  typing()
})

</script>

<template>
  <div @click="clear" class="ai-generated-excerpt rounded-lg bg-$va-c-bg-alt p-4">
    <div font="black" flex items-center>
      <div mr-1 i-ri-robot-2-line />
      <div>
        {{ t('excerpt.ai') }}
      </div>
    </div>
    <div op="90" mt-1>
      {{ content }}
    </div>
  </div>
</template>
