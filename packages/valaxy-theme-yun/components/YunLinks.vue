<script lang="ts" setup>
import { useRandomData } from '../composables'
import type { LinkType } from '../types'

const props = defineProps<{
  links: string | LinkType[]
  random: boolean
  /**
   * @description: 图片加载失败时显示的图片
   */
  errorImg?: string
}>()

const { data } = useRandomData(props.links, props.random)
</script>

<template>
  <div class="yun-links">
    <ul class="yun-link-items" flex="center wrap">
      <YunLinkItem
        v-for="link, i in data"
        :key="i"
        :i="i" :link="link" :error-img="errorImg"
      />
    </ul>
  </div>
</template>

<style lang="scss">
.yun-links {
  .yun-link-items {
    padding-left: 0;
  }

  .yun-link-url {
    --smc-link-color: var(--primary-color);

    display: inline-flex;
    text-align: center;
    justify-self: center;
    line-height: 1.5;
    margin: 0.5rem;
    transition: 0.2s;
    color: var(--primary-color, black);
    border: 1px solid var(--primary-color, gray);

    &:hover {
      color: white;
      background-color: var(--primary-color, gray);
      box-shadow: 0 2px 20px var(--primary-color, gray);
    }

    .yun-link {
      &-left {
        line-height: 0;
      }

      &-avatar {
        margin: 0;
        display: inline-flex;
        border-radius: 50%;
        background-color: #fff;
        border: 1px solid var(--primary-color, gray);
        transition: 0.5s;

        &:hover {
          box-shadow: 0 0 20px rgb(0 0 0 / 0.1);
        }
      }

      &-desc {
        font-size: 0.8rem;
        width: 10rem;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  .yun-link-info {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
