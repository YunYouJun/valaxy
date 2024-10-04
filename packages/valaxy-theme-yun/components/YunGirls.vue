<script lang="ts" setup>
import { useRandomData } from '../composables'
import type { GirlType } from '../types'

const props = defineProps<{
  girls: GirlType[] | string
  random?: boolean
}>()

const { data } = useRandomData(props.girls, props.random)
</script>

<template>
  <div class="girls">
    <ul class="girl-items">
      <YunGirlItem v-for="girl, i in data" :key="i" :i="i" :girl="girl" />
    </ul>
  </div>
</template>

<style lang="scss">
.girls {
  text-align: center;

  .girl-items {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    padding-left: 0;
  }
}

.girls-number {
  color: white;
}
</style>
