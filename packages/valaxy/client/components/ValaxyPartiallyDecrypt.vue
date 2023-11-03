<script lang="ts" setup>
import { runContentUpdated, useDecrypt, useFrontmatter } from 'valaxy'
import { defineComponent, h, onMounted, ref } from 'vue'

const props = defineProps<{
  encryptedContent: string
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
  }
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
    <div v-if="!decryptedContent" my-4 w-full pt-14 pb-10 border rounded-lg border-gray-2>
      <div
        class="decrypt-password-container w-full sm:w-1/2 "
        flex-center m-auto relative
      >
        <p class="-top-12" absolute op="50">
          this content is encrypted
        </p>
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
    </div>
  </div>
</template>
