<script lang="ts" setup>
import type { GirlType } from '../types'
import { computed } from 'vue'
import { useRandomData } from '../composables'

const props = defineProps<{
  girls: GirlType[] | string
  random?: boolean
}>()

const { data } = useRandomData(props.girls, props.random)
const isUrlSource = computed(() => typeof props.girls === 'string')
</script>

<template>
  <div class="girls">
    <ClientOnly v-if="isUrlSource">
      <ul class="girl-items">
        <YunGirlItem v-for="girl, i in data" :key="girl.url" :i="i" :girl="girl" />
      </ul>
    </ClientOnly>
    <ul v-else class="girl-items">
      <YunGirlItem v-for="girl, i in data" :key="girl.url" :i="i" :girl="girl" />
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
