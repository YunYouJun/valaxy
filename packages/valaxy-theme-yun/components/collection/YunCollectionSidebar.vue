<script setup lang="ts">
import { resolveCollectionItemHref, useCollection } from 'valaxy'
import { computed } from 'vue'

const { collection } = useCollection()

const resolvedItems = computed(() => {
  if (!collection.value?.items || !collection.value.key)
    return []
  return collection.value.items.map(item => ({
    ...item,
    ...resolveCollectionItemHref(collection.value.key!, item),
  }))
})
</script>

<template>
  <YunCard class="collection p-4 justify-start items-start" flex="~ col gap-1">
    <section class="yun-sidebar-item w-full">
      <RouterLink :to="`/collections/${collection.key}/`" class="title">
        {{ collection.title }}
      </RouterLink>
      <div class="items">
        <div v-for="item in resolvedItems" :key="item.key || item.link" class="item">
          <div class="indicator" />
          <a
            v-if="item.isExternal"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p class="text inline-flex items-center gap-1">
              {{ item.title }}
              <span class="i-ri-external-link-line text-xs op-50" />
            </p>
          </a>
          <RouterLink
            v-else
            :to="item.href"
          >
            <p class="text">
              {{ item.title }}
            </p>
          </RouterLink>
        </div>
      </div>
    </section>
  </YunCard>
</template>

<style lang="scss">
.collection {
  .yun-sidebar-item {
    .title {
      font-weight: 500;
      font-size: 16px;
      color: var(--va-c-text-1);
    }

    .items {
      border-left: 1px solid var(--va-c-divider);

      color: #666;
      font-size: 0.9em;

      padding-left: 16px;

      .item {
        .text {
          color: var(--va-c-text-2);
          flex-grow: 1;
          padding: 4px 0;
          font-size: 14px;
          line-height: 24px;
          transition: color var(--va-transition-duration);
        }

        .indicator {
          border-radius: 2px;
          width: 2px;
          transition: background-color var(--va-transition-duration);
          position: absolute;
          top: 6px;
          bottom: 6px;
        }

        .router-link-active {
          color: var(--va-c-primary);
          font-weight: 500;

          .text {
            color: var(--va-c-primary);
          }
        }
      }
    }
  }
}
</style>
