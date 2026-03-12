<script lang="ts" setup>
defineProps<{
  text?: string
  ariaLabel?: string
  ariaKeyshortcuts?: string
}>()
</script>

<template>
  <button
    type="button"
    class="PressSearchButton"
    :aria-label="ariaLabel || 'Search'"
    :aria-keyshortcuts="ariaKeyshortcuts"
  >
    <span class="PressSearchButton-icon">
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path
          d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
          stroke="currentColor"
          fill="none"
          fill-rule="evenodd"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="PressSearchButton-text">{{ text || 'Search' }}</span>
    </span>
    <span class="PressSearchButton-keys" aria-hidden="true">
      <kbd class="key-cmd">&#x2318;</kbd>
      <kbd class="key-ctrl">Ctrl</kbd>
      <kbd>K</kbd>
    </span>
  </button>
</template>

<style>
.PressSearchButton {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 8px 14px;
  height: var(--va-nav-height, 55px);
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  transition: border-color var(--va-transition-duration);
}

.PressSearchButton:hover {
  background: transparent;
}

.PressSearchButton:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}

.PressSearchButton:focus:not(:focus-visible) {
  outline: none !important;
}

@media (width >= 768px) {
  .PressSearchButton {
    height: auto;
    padding: 8px 12px;
    border: 1px solid transparent;
    border-radius: 8px;
    background-color: var(--va-c-bg-alt);
    font-size: 14px;
    line-height: 1;
    color: var(--va-c-text-2);
  }

  .PressSearchButton:hover {
    border-color: var(--va-c-primary);
    background: var(--va-c-bg-alt);
  }
}

.PressSearchButton-icon {
  display: flex;
  align-items: center;
}

.PressSearchButton-icon svg {
  position: relative;
  width: 16px;
  height: 16px;
  color: var(--va-c-text-1);
  fill: currentcolor;
  transition: color var(--va-transition-duration-moderate);
}

.PressSearchButton:hover .PressSearchButton-icon svg {
  color: var(--va-c-text-1);
}

@media (width >= 768px) {
  .PressSearchButton-icon svg {
    top: 1px;
    margin-right: 8px;
    width: 14px;
    height: 14px;
    color: var(--va-c-text-2);
  }
}

.PressSearchButton-text {
  display: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--va-c-text-2);
  transition: color var(--va-transition-duration-moderate);
}

.PressSearchButton:hover .PressSearchButton-text {
  color: var(--va-c-text-1);
}

@media (width >= 768px) {
  .PressSearchButton-text {
    display: inline;
  }
}

.PressSearchButton-keys {
  direction: ltr;
  display: none;
  min-width: auto;
}

:root.mac .key-ctrl,
:root:not(.mac) .key-cmd {
  display: none;
}

@media (width >= 768px) {
  .PressSearchButton-keys {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border: 1px solid var(--va-c-divider);
    border-radius: 4px;
  }
}

.PressSearchButton-keys kbd {
  font-family: var(--va-font-sans);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: var(--docsearch-muted-color, var(--va-c-text-2));
}
</style>
