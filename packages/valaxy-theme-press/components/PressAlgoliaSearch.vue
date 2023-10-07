<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useAddonAlgolia } from 'valaxy-addon-algolia'

const { t } = useI18n()

const { loaded, load, metaKey } = useAddonAlgolia()
</script>

<template>
  <div>
    <AlgoliaSearchBox v-if="loaded" />

    <div v-else id="docsearch" @click="load">
      <button
        class="DocSearch DocSearch-Button"
        aria-label="Search"
      >
        <span class="DocSearch-Button-Container">
          <svg
            class="DocSearch-Search-Icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <path
              d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
              stroke="currentColor"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="DocSearch-Button-Placeholder">{{ t('search.placeholder') }}</span>
        </span>
        <span class="DocSearch-Button-Keys">
          <kbd class="DocSearch-Button-Key" />
          <kbd class="DocSearch-Button-Key">K</kbd>
        </span>
      </button>
    </div>
  </div>
</template>

<style>
/* stylelint-disable selector-class-pattern */
.DocSearch-Button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  width: 32px;
  height: 55px;
  background: transparent;
  transition: border-color 0.25s;
}

.DocSearch-Button:hover {
  background: transparent;
}

.DocSearch-Button:focus {
  outline: 1px dotted;
  outline: 5px auto -webkit-focus-ring-color;
}

.DocSearch-Button:focus:not(:focus-visible) {
  outline: none !important;
}

@media (width >= 768px) {
  .DocSearch-Button {
    justify-content: flex-start;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 0 10px 0 12px;
    width: 100%;
    height: 40px;
    background-color: var(--va-c-bg-alt);
  }

  .DocSearch-Button:hover {
    border-color: var(--va-c-brand);
    background: var(--va-c-bg-alt);
  }
}

.DocSearch-Button .DocSearch-Button-Container {
  display: flex;
  align-items: center;
}

.DocSearch-Button .DocSearch-Search-Icon {
  position: relative;
  width: 16px;
  height: 16px;
  color: var(--va-c-text-1);
  fill: currentcolor;
  transition: color 0.5s;
}

.DocSearch-Button:hover .DocSearch-Search-Icon {
  color: var(--va-c-text-1);
}

@media (width >= 768px) {
  .DocSearch-Button .DocSearch-Search-Icon {
    top: 1px;
    margin-right: 8px;
    width: 14px;
    height: 14px;
    color: var(--va-c-text-2);
  }
}

.DocSearch-Button .DocSearch-Button-Placeholder {
  display: none;
  margin-top: 2px;
  padding: 0 16px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--va-c-text-2);
  transition: color 0.5s;
}

.DocSearch-Button:hover .DocSearch-Button-Placeholder {
  color: var(--va-c-text-1);
}

@media (width >= 768px) {
  .DocSearch-Button .DocSearch-Button-Placeholder {
    display: inline-block;
  }
}

.DocSearch-Button .DocSearch-Button-Keys {
  /* rtl:ignore */
  direction: ltr;
  display: none;
  min-width: auto;
}

@media (width >= 768px) {
  .DocSearch-Button .DocSearch-Button-Keys {
    display: flex;
    align-items: center;
  }
}

.DocSearch-Button .DocSearch-Button-Key {
  display: block;
  margin: 2px 0 0;
  border: 1px solid var(--va-c-divider);

  /* rtl:begin:ignore */
  border-right: none;
  border-radius: 4px 0 0 4px;
  padding-left: 6px;

  /* rtl:end:ignore */
  min-width: 0;
  width: auto;
  height: 22px;
  font-family: var(--va-font-sans);
  font-size: 12px;
  font-weight: 500;
  transition: color 0.5s, border-color 0.5s;
}

.DocSearch-Button .DocSearch-Button-Key + .DocSearch-Button-Key {
  /* rtl:begin:ignore */
  border-right: 1px solid var(--va-c-divider);
  border-left: none;
  border-radius: 0 4px 4px 0;
  padding-left: 2px;
  padding-right: 6px;

  /* rtl:end:ignore */
}

.DocSearch-Button .DocSearch-Button-Key:first-child {
  font-size: 1px;
  letter-spacing: -12px;
  color: transparent;
}

.DocSearch-Button .DocSearch-Button-Key:first-child::after {
  /* stylelint-disable-next-line value-keyword-case */
  content: v-bind(metaKey);
  font-size: 12px;
  letter-spacing: normal;
  color: var(--docsearch-muted-color);
}

.DocSearch-Button .DocSearch-Button-Key:first-child > * {
  display: none;
}

.dark .DocSearch-Footer {
  border-top: 1px solid var(--va-c-divider);
}

.DocSearch-Form {
  border: 1px solid var(--va-c-brand);
  background-color: var(--va-c-white);
}

.dark .DocSearch-Form {
  background-color: var(--va-c-bg-soft-mute);
}
</style>
