<script lang="ts" setup>
import { useSiteConfig, useValaxyI18n } from 'valaxy'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { $t } = useValaxyI18n()

const siteConfig = useSiteConfig()
const showQr = ref(false)
const sponsorBtnTitle = computed(() => {
  return siteConfig.value.sponsor?.title ?? t('reward.donate')
})
</script>

<template>
  <div class="yun-sponsor-container flex-center flex-col">
    <button
      class="sponsor-button yun-icon-btn shadow hover:shadow-md"
      :title="sponsorBtnTitle" text="red-400" @click="showQr = !showQr"
    >
      <div class="mt-2px" i-ri-heart-fill />
    </button>

    <div
      class="qrcode-container qrcode flex-center flex-col" m="y-4"
      :class="showQr && 'show'"
    >
      <div v-if="siteConfig.sponsor.description" class="sponsor-description" mb="4" text="sm">
        {{ siteConfig.sponsor.description }}
      </div>
      <div class="flex justify-around">
        <a
          v-for="method, i in siteConfig.sponsor.methods" :key="i"
          class="flex-center flex-col animate-iteration-1 animate-fade-in"
          :href="method.url" target="_blank"
          :style="`color:${method.color}`"
        >
          <img class="sponsor-method-img" border="~ rounded" p="1" loading="lazy" :src="method.url" :title="$t(method.name)">
          <div text="xl" m="2" :class="method.icon" />
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;
@use "valaxy/client/styles/mixins/index.scss" as *;

.sponsor-button {
  background-color: rgb(255 255 255 / 0.1);

  div {
    transform: scale(1.1);
    transition: transform var(--va-transition-duration) ease-in-out;
  }

  &:hover {
    background-color: rgb(255 255 255 / 0.9);

    div {
      transform: scale(1.2);
    }
  }

  a {
    &:hover {
      border: none;
    }
  }
}

.qrcode-container {
  --height: 200px;

  overflow: hidden;
  height: 0;
  opacity: 0;
  transition: all var(--va-transition-duration) map.get($cubic-bezier, 'ease-in-out');

  &.show {
    height: var(--height);
    opacity: 1;
  }
}

@include screen('md') {
  .qrcode-container {
    --height: 260px;
  }
}

.sponsor-description {
  color: get-css-var('c-gray');
}

.sponsor-method-img {
  width: 12rem;
  max-width: 90%;
  aspect-ratio: 1;
}
</style>
