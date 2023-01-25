<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = defineProps<{
  text: string
  items: any[]
}>()

const isOpen = ref(false)

const groupId = computed(() =>
  `NavScreenGroup-${props.text.replace(' ', '-').toLowerCase()}`,
)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="pr-nav-screen-menu-group" :class="{ open: isOpen }">
    <button
      class="button"
      :aria-controls="groupId"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span class="button-text">{{ text }}</span>
      <div i-ri-add-line class="button-icon" />
    </button>

    <div :id="groupId" class="items">
      <template v-for="item in items" :key="item.text">
        <div v-if="'link' in item" :key="item.text" class="item">
          <PressNavScreenMenuGroupLink
            :text="item.text"
            :link="item.link"
          />
        </div>

        <div v-else class="group">
          <PressNavScreenMenuGroupSection
            :text="item.text"
            :items="item.items"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.pr-nav-screen-menu-group {
  border-bottom: 1px solid var(--pr-c-divider);
  height: 48px;
  overflow: hidden;
  transition: border-color 0.5s;
}

.pr-nav-screen-menu-group .items {
  visibility: hidden;
}

.pr-nav-screen-menu-group.open .items {
  visibility: visible;
}

.pr-nav-screen-menu-group.open {
  padding-bottom: 10px;
  height: auto;
}

.pr-nav-screen-menu-group.open .button {
  padding-bottom: 6px;
  color: var(--pr-c-brand);
}

.pr-nav-screen-menu-group.open .button-icon {
  /*rtl:ignore*/
  transform: rotate(45deg);
}

.button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px 11px 0;
  width: 100%;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--pr-c-text-1);
  transition: color 0.25s;
}

.button:hover {
  color: var(--pr-c-brand);
}

.button-icon {
  width: 14px;
  height: 14px;
  fill: var(--pr-c-text-2);
  transition: fill 0.5s, transform 0.25s;
}

.group:first-child {
  padding-top: 0px;
}

.group + .group,
.group + .item {
  padding-top: 4px;
}
</style>
