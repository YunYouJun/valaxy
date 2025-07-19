<script setup lang="ts">
import { useCollection } from 'valaxy'

const { collection } = useCollection()
</script>

<template>
  <YunCard class="collection p-4 min-h-sm justify-start items-start" flex="~ col gap-1">
    <section class="yun-sidebar-item">
      <div class="title">
        {{ collection.title }}
      </div>
      <div class="items">
        <div v-for="item in collection.items" :key="item.key" class="item">
          <div class="indicator" />
          <RouterLink
            :to="`/collections/${collection.key}/${item.key}`"
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
          transition: color .25s;
        }

        .indicator {
          border-radius: 2px;
          width: 2px;
          transition: background-color .25s;
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
