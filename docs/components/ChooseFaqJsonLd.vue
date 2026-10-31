<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { chooseFaq } from '../data/choose-faq'

const props = defineProps<{
  lang: 'en' | 'zh'
}>()

useHead(computed(() => ({
  script: [
    {
      key: 'choose-faqpage',
      type: 'application/ld+json',
      textContent: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': chooseFaq[props.lang].map(item => ({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.answer,
          },
        })),
      },
    },
  ],
})))
</script>

<template>
  <span hidden aria-hidden="true" />
</template>
