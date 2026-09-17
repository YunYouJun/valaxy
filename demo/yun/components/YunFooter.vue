<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'
import YunFooter from 'valaxy-theme-yun/components/YunFooter.vue'
import { onMounted, ref } from 'vue'

const showVisitorStats = ref(true)
const { load } = useScriptTag('//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js', undefined, { immediate: false })

onMounted(async () => {
  try {
    await load()
  }
  catch {
    // Visitor statistics are optional when the external service is unavailable.
    showVisitorStats.value = false
  }
})
</script>

<template>
  <YunFooter>
    <!-- 自定义页脚内容 -->
    <template v-if="showVisitorStats">
      <div>本站总访问量 <span id="busuanzi_value_site_pv" /> 次</div>
      <div>本站访客数 <span id="busuanzi_value_site_uv" /> 人次</div>
    </template>

    <VCLiveTime mt="2" start-time="2022-01-01">
      <template #live-time-before>
        <span>本站已运行</span>
      </template>
    </VCLiveTime>
  </YunFooter>
</template>
