<script setup lang="ts">
import ActionButton from '@antfu/design/components/Action/ActionButton.vue'

defineProps<{
  variant?: 'default' | 'secondary' | 'warn' | 'ghost'
  size?: 'sm' | 'md'
  disabled?: boolean
  loading?: boolean
  icon?: string
  label?: string
  tag?: 'button' | 'a'
}>()
</script>

<template>
  <ActionButton
    :as="tag || 'button'"
    :type="tag === 'a' ? undefined : 'button'"
    :variant="variant === 'ghost' ? 'text' : variant === 'secondary' || variant === 'warn' ? 'action' : 'primary'"
    :size="size || 'sm'"
    :disabled="disabled || loading"
    :loading="loading"
    :icon="icon"
    class="justify-center whitespace-nowrap"
    :class="variant === 'warn' ? 'text-warning-700 dark:text-warning-300 border-warning-600/20' : ''"
  >
    <slot>{{ label }}</slot>
  </ActionButton>
</template>
