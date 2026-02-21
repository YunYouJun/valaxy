<script lang="ts" setup>
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui'

export interface DropdownMenuItemConfig {
  /** Unique key (use 'separator' for a separator line) */
  key: string
  /** Display label */
  label: string
  /** UnoCSS icon class, e.g. 'i-ri-link' */
  icon?: string
  /** Whether this item is disabled */
  disabled?: boolean
}

const { sideOffset = 4, align = 'end' } = defineProps<{
  /** Menu items to render */
  items: DropdownMenuItemConfig[]
  /** reka-ui DropdownMenuContent side offset */
  sideOffset?: number
  /** reka-ui DropdownMenuContent alignment */
  align?: 'start' | 'center' | 'end'
}>()

defineEmits<{
  /** Emitted when a menu item is selected */
  select: [key: string]
}>()

defineSlots<{
  trigger: () => any
  item: (props: { item: DropdownMenuItemConfig }) => any
}>()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent class="yun-dropdown-menu-content" :side-offset="sideOffset" :align="align">
        <template v-for="(item, index) in items" :key="`${item.key}-${index}`">
          <DropdownMenuSeparator v-if="item.key === 'separator'" class="yun-dropdown-menu-separator" />
          <DropdownMenuItem v-else class="yun-dropdown-menu-item" :disabled="item.disabled" @select="$emit('select', item.key)">
            <slot name="item" :item="item">
              <div v-if="item.icon" :class="item.icon" />
              <span>{{ item.label }}</span>
            </slot>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style>
.yun-dropdown-menu-content {
  min-width: 180px;
  background: var(--va-c-bg);
  border: 1px solid var(--va-c-divider);
  border-radius: 0.5rem;
  padding: 0.25rem;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
  z-index: 100;
  animation: yun-dropdown-menu-fade-in 0.15s ease;
}

@keyframes yun-dropdown-menu-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.yun-dropdown-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--va-c-text-2);
  transition: background 0.15s, color 0.15s;
  outline: none;
}

.yun-dropdown-menu-item:hover,
.yun-dropdown-menu-item[data-highlighted] {
  background: var(--va-c-bg-soft);
  color: var(--va-c-text);
}

.yun-dropdown-menu-separator {
  height: 1px;
  background: var(--va-c-divider);
  margin: 0.25rem 0.5rem;
}
</style>
