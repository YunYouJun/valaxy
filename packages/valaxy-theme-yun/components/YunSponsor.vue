<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const config = useSiteConfig()

const showQr = ref(false)
</script>

<template>
  <div class="yun-sponsor-container flex justify-center items-center flex-col">
    <button class="sponsor-button yun-icon-btn shadow hover:shadow-md" :title="t('reward.donate')" text="red-400" @click="showQr = !showQr">
      <div i-ri-heart-line />
    </button>

    <div class="qrcode-container qrcode flex justify-around" m="y-4" :class="showQr && 'show'">
      <a
        v-for="method, i in config.sponsor.methods" :key="i"
        class="flex flex-col justify-center items-center animate-iteration-1"
        :class="showQr && 'animate-fade-in'"
        :href="method.url" target="_blank"
        :style="`color:${method.color}`"
      >
        <img class="sponsor-method-img" border="~ rounded" p="1" loading="lazy" :src="method.url" :title="method.name">
        <div text="xl" m="2" :class="method.icon" />
      </a>
    </div>
  </div>
</template>

<style lang="scss">
.sponsor-button {
  background-color: rgba(255, 255, 255, 0.1);

  div {
    transform: scale(1.1);
    transition: transform var(--va-transition-duration) ease-in-out;
  }
  &:hover {
    background-color: rgba(255, 255, 255, 0.9);

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
  overflow: hidden;
  height: 0;

  transition: height var(--va-transition-duration) ease-in-out;

  &.show {
    height: 220px;
  }
}

.sponsor-method-img {
  width: 12rem;
  max-width: 90%;
  aspect-ratio: 1;
}
</style>
