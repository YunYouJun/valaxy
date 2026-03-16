<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useEditLink, usePrevNext } from '../composables'

const { t } = useI18n()
const editLink = useEditLink()
const control = usePrevNext()
</script>

<template>
  <div class="press-doc-footer">
    <div flex justify="between" items="center" text="sm">
      <a flex items="center" class="decoration-none!" :href="editLink.url" target="_blank" rel="noopener noreferrer">
        <div i-ri-external-link-line />
        <span ml-1>{{ editLink.text || t('tooltip.edit_this_page') }}</span>
      </a>
      <PressDocFooterLastUpdated />
    </div>

    <nav
      v-if="control.prev || control.next"
      class="prev-next"
      aria-label="Pager"
    >
      <div class="pager">
        <RouterLink
          v-if="control.prev"
          class="pager-link prev"
          :to="control.prev.link"
        >
          <span class="desc">{{ t('doc_footer.prev', 'Previous page') }}</span>
          <span class="title">{{ control.prev.text }}</span>
        </RouterLink>
      </div>
      <div class="pager">
        <RouterLink
          v-if="control.next"
          class="pager-link next"
          :to="control.next.link"
        >
          <span class="desc">{{ t('doc_footer.next', 'Next page') }}</span>
          <span class="title">{{ control.next.text }}</span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.prev-next {
  border-top: 1px solid var(--pr-c-divider-light, var(--va-c-divider-light));
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .prev-next {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pager-link {
  display: block;
  border: 1px solid var(--pr-c-divider-light, var(--va-c-divider-light));
  border-radius: 8px;
  padding: 0.75rem 1rem;
  width: 100%;
  transition: border-color 0.25s;
  text-decoration: none;
}

.pager-link:hover {
  border-color: var(--va-c-primary);
}

.pager-link.next {
  text-align: right;
}

.desc {
  display: block;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: var(--va-c-text-light);
}

.title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--va-c-primary);
  transition: color 0.25s;
}
</style>
