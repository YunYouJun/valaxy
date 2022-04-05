<script lang="ts" setup>
import { useRandomData } from 'valaxy-theme-yun/composables'
import { onImgError } from '../utils'

export interface GirlType {
  name: string
  url: string
  avatar: string
  from?: string
  reason?: string
}

const props = defineProps<{
  girls: GirlType[] | string
  random?: boolean
}>()

const { data } = useRandomData(props.girls, props.random)
</script>

<template>
  <div class="girls">
    <ul class="girl-items">
      <li v-for="girl, i in data" :key="girl.name" class="girl-item">
        <a :href="girl.url || 'https://zh.moegirl.org/' + girl.name" :title="girl.reason" alt="portrait" target="_blank" rel="noopener">
          <figure class="girl-info">
            <img class="girl-avatar" loading="lazy" :src="girl.avatar" :alt="girl.name" :onError="onImgError">
            <figcaption class="girl-name" :title="(i+1).toString()">{{ girl.name }}</figcaption>
            <figcaption class="girl-from">{{ girl.from }}</figcaption>
          </figure>
        </a>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
.girls {
  text-align: center;

  .girl-items {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    padding-left: 0;
  }
}

.girls-number {
  color: white;
}

.girl-item {
  display: inline-flex;
  text-align: center;
  justify-content: center;
  width: 8rem;
  margin: 1rem;

  .girl {
    &-info {
      width: 100%;
      padding: 0;
      margin: 0;
    }

    &-avatar {
      object-fit: cover;
      object-position: center top;
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      padding: 0.2rem;
      background-color: #fff;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.12);
      transition: 0.5s;

      &:hover {
        box-shadow: 0 0 2rem rgba(0, 0, 0, 0.12);
      }
    }

    &-name {
      font-size: 0.9rem;
    }

    &-from {
      font-size: 12px;
      font-family: var(--va-font-serif);
      font-weight: bold;
      color: var(--va-c-text-light);

      &::before {
        content: '「';
      }

      &::after {
        content: '」';
      }
    }
  }
}
</style>
