<script setup lang="ts">
// 播放完销毁 css 动画
import { onMounted, ref } from 'vue'

const props = defineProps<{
  duration: number
}>()

const destroy = ref(false)
onMounted(() => {
  setTimeout(() => {
    destroy.value = true
  }, props.duration)
})
</script>

<template>
  <div
    v-if="!destroy"
    class="line-burst-effects absolute"
  >
    <div v-for="i in 8" :key="i" class="line">
      <div>
        <span />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.line-burst-effects {
  .line {
    position: absolute;
    top: 0;
    left: calc(50% - 2px);
    width: 4px;
    height: 100%;
  }

  @for $i from 1 through 8 {
    .line:nth-child(#{$i}) {
      transform: rotate($i * 45deg);

      div {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 20%;
        overflow: hidden;
      }

      span {
        display: block;
        background-color: white;
        content: '';
        width: 100%;
        height: 100%;
        transform: translateY(100%);
        animation: line-burst 0.8s forwards;
      }
    }
  }
}

@keyframes line-burst {
  0% {
    transform: translateY(100%);
  }

  100% {
    transform: translateY(-100%);
  }
}
</style>
