<script lang="ts" setup>
import { useDecrypt, useFrontmatter } from 'valaxy'
import type { Ref } from 'vue'
import { defineComponent, h, inject, onMounted, ref } from 'vue'

const props = defineProps<{
  encryptedContent: string
}>()

const password = ref('')
const decryptedContent = ref('')

const hasError = ref(false)

const onContentUpdated = inject('onContentUpdated') as Ref<() => void>

const { decrypt } = useDecrypt()
async function decryptContent() {
  const ciphertext = props.encryptedContent
  if (!ciphertext)
    return
  try {
    const result = await decrypt(password.value, ciphertext)
    decryptedContent.value = result || ''

    setTimeout(() => {
      onContentUpdated.value?.()
    }, 16)
  }
  catch (e) {
    hasError.value = true
  }
}

function encryptAgain() {
  decryptedContent.value = ''
  password.value = ''

  setTimeout(() => {
    onContentUpdated.value?.()
  }, 16)
}

const ValaxyDeprecatedContent = defineComponent({
  name: 'ValaxyDeprecatedContent',
  props: {
    html: String,
  },
  render() {
    const content = `<div>${this.html}</div>`
    return h({
      setup: () => {
        const fm = useFrontmatter()
        return {
          frontmatter: fm,
        }
      },
      template: content,
    })
  },
})

const hasWarning = ref(false)
onMounted(() => {
  if (location.protocol !== 'https:')
    hasWarning.value = true
})
</script>

<template>
  <div>
    <div v-if="!decryptedContent" w-full pt-14 pb-10>
      <div
        class="decrypt-password-container w-full sm:w-1/2"
        flex-center m-auto relative
      >
        <input
          v-model="password"
          w-full
          border pl-5 pr-11 py-3 rounded hover:shadow transition
          type="password" placeholder="Enter password"
          :class="hasError && 'border-red'"
          @input="hasError = false"
          @keyup.enter="decryptContent"
        >
        <div
          cursor-pointer
          absolute text-2xl
          i-ri-arrow-right-circle-line right-3
          text-gray hover:text-black
          @click="decryptContent"
        />

        <div v-if="hasWarning" class="-bottom-6" absolute text-xs op="50">
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API" target="_blank">
            <span>Web Crypto API</span>
          </a> Only works in HTTPS
        </div>
      </div>
    </div>
    <div v-else>
      <ValaxyDeprecatedContent :html="decryptedContent" />
      <div w-full text-center mt-8>
        <button m-auto class="btn" font-bold @click="encryptAgain">
          Encrypt Again
        </button>
      </div>
    </div>
  </div>
</template>
