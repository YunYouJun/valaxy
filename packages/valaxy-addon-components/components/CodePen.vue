<script lang="ts" setup>
import { useScriptTag } from '@vueuse/core'

withDefaults(defineProps<{
  /**
   * Pen Hash ID
   */
  id: string
  /**
   * User ID
   */
  user: string
  name?: string
  tab?: string
}>(), {
  name: '',
  tab: 'html,result',
})

// use codepen script
// useScriptTag instead of useHead script for not repeat
useScriptTag('https://static.codepen.io/assets/embed/ei.js')
</script>

<template>
  <p
    class="codepen flex justify-center items-center box-border border-2px border-solid my-4 p-4"
    :data-default-tab="tab" :data-slug-hash="id" :data-user="user"
  >
    <slot>
      <span>
        See the Pen
        <a v-if="name" :href="`https://codepen.io/${user}/pen/${id}`">{{ name }}</a>
        by {{ user }} (<a :href="`https://codepen.io/${user}`">@{{ user }}</a>)
        on <a href="https://codepen.io">CodePen</a>.
      </span>
    </slot>
  </p>
</template>
