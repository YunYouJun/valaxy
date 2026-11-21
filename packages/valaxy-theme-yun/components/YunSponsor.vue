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
  <div class="yun-sponsor-container flex-center flex-col w-full">
    <button
      type="button"
      class="sponsor-button"
      :class="{ 'is-open': showQr }"
      :title="sponsorBtnTitle"
      :aria-label="sponsorBtnTitle"
      :aria-expanded="showQr"
      @click="showQr = !showQr"
    >
      <span class="sponsor-button-icon i-ri-heart-fill" aria-hidden="true" />
    </button>

    <div
      class="qrcode-container"
      :class="{ show: showQr }"
    >
      <div class="qrcode-inner flex flex-col items-center">
        <div v-if="siteConfig.sponsor?.description" class="sponsor-description">
          {{ siteConfig.sponsor.description }}
        </div>
        <div class="sponsor-methods">
          <a
            v-for="(method, i) in siteConfig.sponsor?.methods || []"
            :key="i"
            class="sponsor-method-card"
            :href="method.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="$t(method.name)"
            :style="method.color ? { '--yun-sponsor-color': method.color } : undefined"
          >
            <div class="sponsor-method-qr">
              <img
                class="sponsor-method-img"
                loading="lazy"
                decoding="async"
                :src="method.url"
                :alt="$t(method.name)"
                :title="$t(method.name)"
              >
            </div>
            <div class="sponsor-method-label">
              <span v-if="method.icon" class="sponsor-method-icon" :class="method.icon" aria-hidden="true" />
              <span class="sponsor-method-name">{{ $t(method.name) }}</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.yun-sponsor-container {
  width: 100%;
}

.sponsor-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 1px solid var(--yun-surface-line);
  border-radius: 9999px;
  color: var(--yun-sponsor-btn-color, #e15a64);
  background-color: var(--va-c-bg-light);
  box-shadow: 0 2px 8px -2px rgb(20 35 60 / 0.08);
  cursor: pointer;
  transition:
    background-color 200ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease,
    color 200ms ease;

  .sponsor-button-icon {
    font-size: 1.25rem;
    transition: transform 200ms var(--yun-ease-in-out);
  }

  &.is-open {
    border-color: color-mix(in srgb, var(--yun-sponsor-btn-color, #e15a64) 42%, var(--yun-surface-line));
    background-color: color-mix(in srgb, var(--yun-sponsor-btn-color, #e15a64) 12%, var(--va-c-bg-light));
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: color-mix(in srgb, var(--yun-sponsor-btn-color, #e15a64) 38%, var(--yun-surface-line));
      background-color: color-mix(in srgb, var(--yun-sponsor-btn-color, #e15a64) 8%, var(--va-c-bg-light));
      box-shadow: var(--yun-card-hover-shadow);

      @media (prefers-reduced-motion: no-preference) {
        .sponsor-button-icon {
          transform: scale(1.12);
        }
      }
    }
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    .sponsor-button-icon {
      transition: none;
    }
  }
}

html.dark .sponsor-button {
  box-shadow: 0 4px 12px -2px rgb(0 0 0 / 0.35);
}

.qrcode-container {
  display: grid;
  grid-template-rows: 0fr;
  width: 100%;
  margin-top: 0;
  opacity: 0;
  visibility: hidden;
  transition:
    grid-template-rows 260ms var(--yun-ease-in-out),
    opacity 220ms ease,
    margin-top 260ms var(--yun-ease-in-out),
    visibility 260ms;

  &.show {
    grid-template-rows: 1fr;
    margin-top: 1rem;
    opacity: 1;
    visibility: visible;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.qrcode-inner {
  min-height: 0;
  overflow: hidden;
}

.sponsor-description {
  margin-bottom: 0.75rem;
  padding-inline: 0.5rem;
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
  text-align: center;
}

.sponsor-methods {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.25rem 0.5rem 0.75rem;
}

.sponsor-method-card {
  display: flex;
  flex: 0 1 10.5rem;
  flex-direction: column;
  align-items: center;
  min-width: 9rem;
  max-width: 11rem;
  padding: 0.625rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: 0.75rem;
  color: var(--va-c-text);
  background-color: var(--va-c-bg-light);
  text-decoration: none;
  transition:
    transform 220ms var(--yun-ease-in-out),
    border-color 220ms ease,
    box-shadow 220ms ease;

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.sponsor-method-qr {
  width: 100%;
  padding: 0.375rem;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.06);
}

.sponsor-method-img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 0.25rem;
}

.sponsor-method-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  color: var(--va-c-text-2);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
  transition: color 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.sponsor-method-icon {
  flex-shrink: 0;
  font-size: 1.125rem;
  color: var(--yun-sponsor-color, var(--va-c-link));
}

@media (hover: hover) and (pointer: fine) {
  .sponsor-method-card:hover {
    border-color: color-mix(in srgb, var(--yun-sponsor-color, var(--va-c-link)) 38%, var(--yun-surface-line));
    box-shadow: var(--yun-card-hover-shadow);

    @media (prefers-reduced-motion: no-preference) {
      transform: translateY(-2px);
    }

    .sponsor-method-label {
      color: var(--va-c-text);
    }
  }
}
</style>
