<script lang="ts" setup>
import { runContentUpdated, useDecrypt, useFrontmatter } from 'valaxy'
import { computed, defineComponent, h, ref } from 'vue'

const props = defineProps<{
  encryptedContent: string
  hint?: string
}>()

const password = ref('')
const decryptedContent = ref('')

const hasError = ref(false)

const { decrypt } = useDecrypt()
async function decryptContent() {
  const ciphertext = props.encryptedContent
  if (!ciphertext)
    return
  try {
    const result = await decrypt(password.value, ciphertext)
    decryptedContent.value = result || ''

    setTimeout(() => {
      runContentUpdated()
    }, 16)
  }
  catch (e) {
    hasError.value = true
    console.error(e)
  }
}

function encryptAgain() {
  decryptedContent.value = ''
  password.value = ''

  setTimeout(() => {
    runContentUpdated()
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

const hasWarning = computed(() => location.protocol !== 'https:')
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
          border="~ solid dark:dark-100"
          pl-5 pr-11 py-3 rounded-full hover:shadow transition
          type="password" placeholder="Enter password"
          :class="hasError && 'border-red'"
          @input="hasError = false"
          @keyup.enter="decryptContent"
        >
        <div
          class="text-gray/70 hover:text-gray transition"
          cursor-pointer
          absolute text-2xl
          i-ri-arrow-right-circle-line right-3
          @click="decryptContent"
        />

        <div v-if="hint" class="-top-6" absolute text-xs op="50">
          <div v-html="hint" />
        </div>

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
