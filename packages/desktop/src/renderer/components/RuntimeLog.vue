<script setup lang="ts">
defineProps<{
  /** Bounded plain-text output from the selected project's processes. */
  logs: string
}>()
</script>

<template>
  <details class="runtime-log">
    <summary>运行日志 <span>查看安装、预览和构建详情</span></summary>
    <pre aria-label="运行日志">{{ logs || '项目启动和构建的信息会显示在这里。' }}</pre>
  </details>
</template>

<style scoped>
.runtime-log { background: var(--paper); border-top: 1px solid var(--line); }
.runtime-log summary { padding: 13px 24px; cursor: pointer; font-size: 12px; }
.runtime-log summary span { color: var(--muted); margin-left: 15px; font-size: 11px; }
.runtime-log pre { max-height: 240px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; padding: 8px 24px 20px; font: 11px/1.7 var(--mono); user-select: text; }
</style>
