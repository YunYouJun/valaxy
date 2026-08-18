<script lang="ts" setup>
const props = defineProps<{
  icon: string
  link: string
  ariaLabel?: string
}>()

function getAccessibleLabel() {
  if (props.ariaLabel)
    return props.ariaLabel

  try {
    return new URL(props.link).hostname
  }
  catch {
    return 'Social link'
  }
}
</script>

<template>
  <a
    class="pr-social-link"
    :href="link"
    :aria-label="getAccessibleLabel()"
    target="_blank"
    rel="noopener"
  >
    <div :class="icon" />
  </a>
</template>

<style scoped>
.pr-social-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  color: var(--pr-c-text-2);
  transition: color var(--va-transition-duration-moderate);
}

.pr-social-link:hover {
  color: var(--pr-c-text-1);
  transition: color var(--va-transition-duration);
}

.pr-social-link > :deep(svg) {
  width: 20px;
  height: 20px;
  fill: currentcolor;
}
</style>
